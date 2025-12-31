# main.js - JSON转Excel工具说明

## 概述

`main.js`是一个功能强大的JSON转Excel转换工具，支持多种转换模式和数据处理能力。它可以处理复杂的嵌套JSON结构，包括时序数据、数组和多层嵌套对象，并将其转换为易于阅读和分析的Excel格式。

## 主要功能

- **智能数据处理**：自动检测和处理时序数据（如Azure监控数据）
- **通用JSON扁平化**：将复杂嵌套JSON转换为扁平结构
- **多种转换模式**：支持单个文件、批量文件和目录批量转换
- **灵活配置**：支持自定义工作表名称和列宽设置
- **错误处理**：完善的错误检测和友好的错误提示

## 安装要求

- Node.js 12.0或更高版本
- xlsx库（通过npm install xlsx安装）

## 命令行用法

### 基本语法

```bash
node main.js <input> <output> [options]
```

### 转换模式

#### 1. 单个文件转换
```bash
node main.js <input.json> <output.xlsx>
```

#### 2. 批量文件转换
```bash
node main.js <input1.json> <output1.xlsx> <input2.json> <output2.xlsx> ...
```

#### 3. 目录批量转换
```bash
node main.js <input_dir> <output_dir>
```

### 可用选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| --sheet-name <name> | 设置Excel工作表名称 | Data |
| --disable-auto-width | 禁用自动列宽调整 | 启用 |

## 使用示例

### 单个文件转换
```bash
node main.js data.json output.xlsx
```

### 批量文件转换
```bash
node main.js data1.json output1.xlsx data2.json output2.xlsx
```

### 目录转换
```bash
node main.js ./Examples ./Outputs
```

### 自定义工作表名称
```bash
node main.js data.json output.xlsx --sheet-name MyData
```

### 禁用自动列宽
```bash
node main.js data.json output.xlsx --disable-auto-width
```

## 数据处理逻辑

### 时序数据处理

工具会自动检测时序数据（包含time、timestamp、timeStamp等时间字段的数组），并将其转换为适合Excel分析的格式。特别优化了Azure监控数据格式的处理。

### JSON扁平化

对于非时序数据，工具会将嵌套的JSON结构扁平化为二维表格，使用点表示法表示嵌套关系：

```json
{
  "parent": {
    "child": {
      "value": 123
    }
  }
}
```

扁平化为：
```
parent.child.value: 123
```

### 数组处理

数组元素会使用索引标识：

```json
{
  "items": [
    { "name": "item1" },
    { "name": "item2" }
  ]
}
```

扁平化为：
```
items[0].name: item1
items[1].name: item2
```

## API参考

### 导出函数

#### jsonToExcel(jsonPath, outputPath, options)

主转换函数，将JSON文件转换为Excel文件。

- **jsonPath**：输入JSON文件路径
- **outputPath**：输出Excel文件路径
- **options**：配置选项对象
  - **sheetName**：工作表名称
  - **disableAutoColumnWidth**：是否禁用自动列宽
  - **customProcessor**：自定义数据处理器函数

#### flattenJSON(obj, prefix)

递归扁平化JSON对象。

- **obj**：要扁平化的JSON对象
- **prefix**：前缀，用于构建嵌套字段名

#### processTimeSeriesData(jsonData)

处理时序数据，自动检测并转换时间序列数据。

- **jsonData**：要处理的JSON数据

#### processAzureTimeSeriesData(jsonData)

专门处理Azure监控数据格式的时序数据。

- **jsonData**：Azure监控数据

#### detectAndProcessTimeSeries(jsonData)

自动检测并处理通用时序数据格式。

- **jsonData**：要处理的JSON数据

## 注意事项

1. 工具会自动创建输出目录（如果不存在）
2. 对于大型JSON文件，转换可能需要较长时间
3. 扁平化后字段数量过多（超过100个）可能会导致Excel性能问题
4. 支持的JSON格式：UTF-8编码的JSON文件

## 错误处理

工具提供了完善的错误处理机制，包括：
- 文件不存在检测
- JSON语法错误提示
- 无效文件格式警告
- 文件系统错误处理

## 版本信息

当前版本：1.0.0

## 与json_to_excel.js的区别

`main.js`与`json_to_excel.js`相比：
- 使用位置参数而非标志参数
- 支持批量文件转换模式
- 提供了更多的API导出函数
- 目录转换时会创建输出目录

## 支持的输入数据类型

- 通用JSON对象和数组
- Azure监控API响应数据
- 时序数据（包含时间戳字段）
- 复杂嵌套JSON结构