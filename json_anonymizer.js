const fs = require('fs');
const path = require('path');

// 敏感ID字段列表
const sensitiveFields = [
    'meterId',
    'productId',
    'skuId',
    'serviceId',
    'CustomerEntityId',
    'id' // 用于处理包含订阅信息的URL
];

// 用于存储ID映射，确保相同的ID始终被替换为相同的值
const idMappings = {};

// 生成匿名ID的函数
function generateAnonymousId(originalId, fieldType) {
    if (!originalId) return originalId;
    
    const key = `${fieldType}:${originalId}`;
    if (idMappings[key]) {
        return idMappings[key];
    }
    
    // 使用简单的哈希算法生成匿名ID
    let hash = 0;
    for (let i = 0; i < originalId.length; i++) {
        const char = originalId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    let anonymousId;
    switch (fieldType) {
        case 'meterId':
            // 生成UUID格式的匿名ID
            const hex = Math.abs(hash).toString(16).padStart(32, '0');
            anonymousId = `anon-${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
            break;
        case 'id':
            // 仅替换订阅ID部分
            anonymousId = originalId.replace(/subscriptions\/[^\/]+/, `subscriptions/anon-${Math.abs(hash).toString(16)}`);
            break;
        default:
            // 生成短字符串格式的匿名ID
            anonymousId = `anon-${Math.abs(hash).toString(16)}`;
    }
    
    idMappings[key] = anonymousId;
    return anonymousId;
}

// 递归处理JSON数据
function processJsonData(data) {
    if (Array.isArray(data)) {
        return data.map(item => processJsonData(item));
    } else if (data !== null && typeof data === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            if (sensitiveFields.includes(key)) {
                result[key] = generateAnonymousId(value, key);
            } else {
                result[key] = processJsonData(value);
            }
        }
        return result;
    }
    return data;
}

// 处理单个JSON文件
function anonymizeJsonFile(filePath) {
    console.log(`正在处理文件: ${filePath}`);
    
    try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(content);
        
        // 处理数据
        const anonymizedData = processJsonData(jsonData);
        
        // 写入处理后的内容
        fs.writeFileSync(filePath, JSON.stringify(anonymizedData, null, 2), 'utf8');
        
        console.log(`文件处理完成: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error.message);
        return false;
    }
}

// 批量处理目录中的所有JSON文件
function batchAnonymize(directoryPath) {
    console.log(`开始批量处理目录: ${directoryPath}`);
    
    try {
        // 获取目录中的所有文件
        const files = fs.readdirSync(directoryPath);
        
        // 过滤出JSON文件并处理
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        
        console.log(`找到 ${jsonFiles.length} 个JSON文件`);
        
        let successCount = 0;
        let errorCount = 0;
        
        jsonFiles.forEach(file => {
            const filePath = path.join(directoryPath, file);
            if (anonymizeJsonFile(filePath)) {
                successCount++;
            } else {
                errorCount++;
            }
        });
        
        console.log(`批量处理完成: 成功 ${successCount} 个，失败 ${errorCount} 个`);
        return { success: successCount, error: errorCount };
    } catch (error) {
        console.error(`批量处理目录 ${directoryPath} 时出错:`, error.message);
        return null;
    }
}

// 主函数
function main() {
    // 默认处理 ./Examples 目录
    const targetDirectory = './Examples';
    
    console.log('JSON数据匿名化工具');
    console.log('==================');
    console.log(`目标目录: ${targetDirectory}`);
    console.log(`敏感字段: ${sensitiveFields.join(', ')}`);
    console.log('\n开始处理...');
    
    // 执行批量处理
    const result = batchAnonymize(targetDirectory);
    
    if (result) {
        console.log('\n处理结果:');
        console.log(`成功: ${result.success}`);
        console.log(`失败: ${result.error}`);
    } else {
        console.log('\n处理失败');
    }
    
    console.log('\n匿名化完成！');
}

// 执行主函数
if (require.main === module) {
    main();
}

// 导出函数，以便在其他地方使用
module.exports = {
    anonymizeJsonFile,
    batchAnonymize,
    processJsonData
};