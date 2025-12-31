const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * 递归扁平化JSON对象，处理嵌套结构
 * @param {Object} obj - 要扁平化的JSON对象
 * @param {string} prefix - 前缀，用于构建嵌套字段名
 * @returns {Object} 扁平化后的对象
 */
function flattenJSON(obj, prefix = '') {
  let flattened = {};
  
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (Array.isArray(obj[key])) {
        // 处理数组，使用索引标识
        obj[key].forEach((item, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (typeof item === 'object' && item !== null) {
            const arrayFlattened = flattenJSON(item, arrayKey);
            flattened = { ...flattened, ...arrayFlattened };
          } else {
            flattened[arrayKey] = item;
          }
        });
      } else if (typeof obj[key] === 'object' && obj !== null) {
        // 处理嵌套对象
        const nestedFlattened = flattenJSON(obj[key], newKey);
        flattened = { ...flattened, ...nestedFlattened };
      } else {
        // 处理基本类型
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

/**
 * 处理Azure监控数据格式的时序数据
 * @param {Object} jsonData - Azure监控数据
 * @returns {Array} 处理后的时序数据数组
 */
function processAzureTimeSeriesData(jsonData) {
  let result = [];
  
  if (jsonData.values && Array.isArray(jsonData.values)) {
    jsonData.values.forEach(value => {
      const startTime = value.starttime;
      const endTime = value.endtime;
      const interval = value.interval;
      
      if (value.value && Array.isArray(value.value)) {
        value.value.forEach(metric => {
          const metricId = metric.id;
          const metricName = metric.name ? metric.name.value || metric.name.localizedValue : 'Unnamed';
          const metricType = metric.type;
          const metricUnit = metric.unit;
          
          if (metric.timeseries && Array.isArray(metric.timeseries)) {
            metric.timeseries.forEach((timeseries, tsIndex) => {
              if (timeseries.data && Array.isArray(timeseries.data)) {
                timeseries.data.forEach(dataPoint => {
                  const row = {
                    startTime,
                    endTime,
                    interval,
                    metricId,
                    metricName,
                    metricType,
                    metricUnit,
                    timeSeriesIndex: tsIndex,
                    ...dataPoint
                  };
                  result.push(row);
                });
              }
            });
          }
        });
      }
    });
  }
  
  return result;
}

/**
 * 自动检测并处理时序数据
 * @param {Object} jsonData - 要处理的JSON数据
 * @returns {Array} 处理后的时序数据数组
 */
function detectAndProcessTimeSeries(jsonData) {
  let result = [];
  
  // 查找包含时序数据特征的数组（包含timeStamp、timestamp、time等字段的对象数组）
  const findTimeSeriesArrays = (obj, parentPath = '', context = {}) => {
    if (Array.isArray(obj)) {
      // 检查数组是否包含时序数据点
      const timeFieldNames = ['timeStamp', 'timestamp', 'time', 'date', 'datetime', 'createdAt', 'updatedAt'];
      const hasTimeField = obj.some(item => 
        typeof item === 'object' && item !== null && 
        timeFieldNames.some(timeField => item[timeField])
      );
      
      if (hasTimeField) {
        // 这可能是一个时序数据数组
        obj.forEach((item, index) => {
          const row = { 
            ...context, 
            ...item, 
            [`${parentPath}Index`]: index 
          };
          result.push(row);
        });
        return true;
      } else {
        // 递归检查数组中的每个对象
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            findTimeSeriesArrays(item, `${parentPath}[${index}]`, { ...context });
          }
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      // 递归检查对象的每个属性，保留父级上下文
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newPath = parentPath ? `${parentPath}.${key}` : key;
          // 只将简单类型添加到上下文
          const newContext = typeof obj[key] !== 'object' && obj[key] !== null 
            ? { ...context, [newPath]: obj[key] } 
            : { ...context };
          findTimeSeriesArrays(obj[key], newPath, newContext);
        }
      }
    }
    
    return false;
  };
  
  const found = findTimeSeriesArrays(jsonData);
  
  return found ? result : [];
}

/**
 * 处理时序数据，将其展开为多行
 * @param {Object} jsonData - 要处理的JSON数据
 * @returns {Array} 处理后的时序数据数组
 */
function processTimeSeriesData(jsonData) {
  // 首先尝试处理Azure监控数据格式
  let azureData = processAzureTimeSeriesData(jsonData);
  if (azureData.length > 0) {
    return azureData;
  }
  
  // 如果不是Azure格式，尝试自动识别时序数据
  let autoDetectedData = detectAndProcessTimeSeries(jsonData);
  if (autoDetectedData.length > 0) {
    return autoDetectedData;
  }
  
  // 如果没有检测到时序数据，返回空数组
  return [];
}

/**
 * JSON转Excel主函数
 * @param {string} jsonPath - 输入JSON文件路径
 * @param {string} outputPath - 输出Excel文件路径
 * @param {Object} options - 配置选项
 * @returns {boolean} 转换是否成功
 */
function jsonToExcel(jsonPath, outputPath, options = {}) {
  try {
    // 验证文件路径
    if (!fs.existsSync(jsonPath)) {
      console.error(`错误：输入文件不存在：${jsonPath}`);
      return false;
    }
    
    // 获取文件扩展名
    const jsonExt = path.extname(jsonPath).toLowerCase();
    if (jsonExt !== '.json') {
      console.warn(`警告：输入文件扩展名不是.json，可能不是有效的JSON文件`);
    }
    
    // 读取JSON文件
    console.log(`正在读取JSON文件：${jsonPath}`);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log('正在处理JSON数据...');
    
    // 处理数据
    let processedData;
    
    // 检查是否使用自定义处理器
    if (options.customProcessor) {
      processedData = options.customProcessor(jsonData);
    } else {
      // 先尝试时序数据处理
      processedData = processTimeSeriesData(jsonData);
      
      // 如果没有时序数据，使用通用扁平化
      if (processedData.length === 0) {
        console.log('没有检测到时序数据，使用通用扁平化处理');
        
        // 处理数据
        if (Array.isArray(jsonData)) {
          // 如果是数组，分别扁平化每个元素
          processedData = jsonData.map((item, index) => {
            const flattened = flattenJSON(item);
            return { index, ...flattened };
          });
        } else {
          // 查找根对象中的数组字段
          const arrayFields = Object.keys(jsonData).filter(key => Array.isArray(jsonData[key]));
          
          if (arrayFields.length > 0) {
            // 如果有数组字段，优先处理最大的数组
            const largestArrayField = arrayFields.reduce((prev, curr) => 
              jsonData[curr].length > jsonData[prev].length ? curr : prev
            );
            
            console.log(`检测到根对象中的数组字段 "${largestArrayField}"，将其展开为多行`);
            
            // 提取数组和非数组字段
            const arrayData = jsonData[largestArrayField];
            const nonArrayFields = Object.keys(jsonData).filter(key => !Array.isArray(jsonData[key]));
            const rootContext = {};
            
            // 收集根对象的非数组字段作为公共上下文
            nonArrayFields.forEach(key => {
              rootContext[key] = jsonData[key];
            });
            
            // 展开数组，每个元素作为一行，同时保留根对象的非数组字段
            processedData = arrayData.map((item, index) => {
              const flattenedItem = flattenJSON(item);
              return {
                [`${largestArrayField}Index`]: index,
                ...rootContext,
                ...flattenedItem
              };
            });
          } else {
            // 否则扁平化整个对象
            const flattened = flattenJSON(jsonData);
            
            // 如果扁平化后字段太多，可能需要特殊处理
            if (Object.keys(flattened).length > 100) {
              console.warn('警告：扁平化后字段数量过多（超过100个），可能会导致Excel性能问题');
            }
            
            processedData = [flattened];
          }
        }
      }
    }
    
    console.log(`共处理 ${processedData.length} 行数据`);
    
    // 创建Excel工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    
    // 调整列宽
    if (!options.disableAutoColumnWidth) {
      const columnWidths = processedData.length > 0 
        ? Object.keys(processedData[0]).map(key => ({ wch: Math.max(key.length + 2, 10) }))
        : [];
      worksheet['!cols'] = columnWidths;
    }
    
    // 设置工作表名称
    const sheetName = options.sheetName || 'Data';
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 写入Excel文件
    XLSX.writeFile(workbook, outputPath);
    
    console.log(`成功将JSON转换为Excel文件：${outputPath}`);
    return true;
  } catch (error) {
    console.error('转换过程中发生错误：');
    if (error instanceof SyntaxError) {
      console.error('JSON语法错误：', error.message);
    } else if (error.code === 'ENOENT') {
      console.error('文件不存在：', error.path);
    } else {
      console.error(error);
    }
    return false;
  }
}

// 支持命令行调用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法：');
    console.log('  单个文件转换：node main.js <input.json> <output.xlsx>');
    console.log('  批量文件转换：node main.js <input1.json> <output1.xlsx> <input2.json> <output2.xlsx> ...');
    console.log('  目录批量转换：node main.js <input_dir> <output_dir>');
    console.log('');
    console.log('选项：');
    console.log('  --sheet-name <name>    设置Excel工作表名称（默认：Data）');
    console.log('  --disable-auto-width   禁用自动列宽调整');
    console.log('');
    console.log('示例：');
    console.log('  单个文件：node main.js data.json output.xlsx');
    console.log('  批量文件：node main.js data1.json output1.xlsx data2.json output2.xlsx');
    console.log('  目录转换：node main.js ./Examples ./Outputs');
    console.log('  自定义设置：node main.js data.json output.xlsx --sheet-name MyData');
    process.exit(1);
  }
  
  // 解析命令行参数
  const options = {};
  
  if (args.includes('--disable-auto-width')) {
    options.disableAutoColumnWidth = true;
  }
  
  const sheetNameIndex = args.indexOf('--sheet-name');
  if (sheetNameIndex > -1 && args[sheetNameIndex + 1]) {
    options.sheetName = args[sheetNameIndex + 1];
  }
  
  // 提取选项参数，剩余的参数为输入输出路径
  const optionArgs = ['--sheet-name', '--disable-auto-width'];
  const pathArgs = args.filter(arg => !optionArgs.includes(arg) && 
    !(optionArgs.includes(args[args.indexOf(arg) - 1])));
  
  // 处理输入输出路径
  if (pathArgs.length === 2) {
    // 单个文件或目录转换
    const inputPath = pathArgs[0];
    const outputPath = pathArgs[1];
    
    // 检查是否为目录
    if (fs.existsSync(inputPath) && fs.lstatSync(inputPath).isDirectory()) {
      // 目录转换
      if (!fs.existsSync(outputPath)) {
        console.log(`创建输出目录：${outputPath}`);
        fs.mkdirSync(outputPath, { recursive: true });
      }
      
      // 获取目录中的JSON文件
      const jsonFiles = fs.readdirSync(inputPath).filter(file => 
        path.extname(file).toLowerCase() === '.json');
      
      if (jsonFiles.length === 0) {
        console.log(`目录 ${inputPath} 中没有JSON文件`);
        process.exit(0);
      }
      
      console.log(`开始批量转换 ${jsonFiles.length} 个JSON文件...`);
      
      // 批量转换每个JSON文件
      let successCount = 0;
      let failCount = 0;
      
      jsonFiles.forEach(file => {
        const jsonFilePath = path.join(inputPath, file);
        const excelFileName = path.basename(file, '.json') + '.xlsx';
        const excelFilePath = path.join(outputPath, excelFileName);
        
        console.log(`\n转换文件：${file}`);
        
        if (jsonToExcel(jsonFilePath, excelFilePath, options)) {
          successCount++;
        } else {
          failCount++;
        }
      });
      
      console.log(`\n批量转换完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    } else {
      // 单个文件转换
      jsonToExcel(inputPath, outputPath, options);
    }
  } else if (pathArgs.length > 2 && pathArgs.length % 2 === 0) {
    // 批量文件转换
    const filePairs = [];
    for (let i = 0; i < pathArgs.length; i += 2) {
      filePairs.push([pathArgs[i], pathArgs[i + 1]]);
    }
    
    console.log(`开始批量转换 ${filePairs.length} 个文件对...`);
    
    let successCount = 0;
    let failCount = 0;
    
    filePairs.forEach(([inputFile, outputFile]) => {
      console.log(`\n转换文件：${inputFile} -> ${outputFile}`);
      
      if (jsonToExcel(inputFile, outputFile, options)) {
        successCount++;
      } else {
        failCount++;
      }
    });
    
    console.log(`\n批量转换完成：成功 ${successCount} 个，失败 ${failCount} 个`);
  } else {
    console.error('错误：输入输出路径数量不匹配');
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  jsonToExcel,
  flattenJSON,
  processTimeSeriesData,
  processAzureTimeSeriesData,
  detectAndProcessTimeSeries
};
