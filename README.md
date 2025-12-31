# JSON转Excel工具 (json_to_excel.js)

一个功能强大的通用JSON转Excel转换工具，支持处理复杂的嵌套结构、时序数据和批量转换。

## 功能特性

- **复杂嵌套结构处理**：递归扁平化JSON对象，支持多层嵌套结构
- **时序数据支持**：自动检测并处理包含时间戳的时序数据（如Azure监控数据）
- **批量转换**：支持单个文件转换和目录批量转换
- **灵活的参数配置**：通过命令行参数自定义转换行为
- **智能数组处理**：自动检测并展开根对象中的数组字段
- **自定义工作表名称**：支持指定Excel工作表名称
- **列宽自动调整**：自动优化Excel列宽以适应内容

## 安装

### 系统要求
- Node.js 14.0.0 或更高版本

### 依赖安装

1. 克隆或下载项目
2. 进入项目目录，运行以下命令安装依赖：

```bash
npm install
```

## 快速开始

### 单个文件转换

```bash
node json_to_excel.js -i ./Examples/Network_complete_dms15sseghk_1766051347915.json -o output_network.xlsx
```

### 批量转换

```bash
# 批量转换当前目录下的所有JSON文件
node json_to_excel.js -b -o ./Outputs

# 批量转换指定目录下的所有JSON文件
node json_to_excel.js -b -i ./Examples -o ./Outputs
```

### 使用npm脚本

```bash
# 单个文件转换
npm run convert -- -i ./Examples/Network_complete_dms15sseghk_1766051347915.json -o output_network.xlsx

# 批量转换
npm run convert -- -b -i ./Examples -o ./Outputs
```

## 命令行参数

### 必选参数

| 参数 | 描述 | 示例 |
|------|------|------|
| `-i <path>` | 指定输入文件或目录路径 | `-i ./data.json` |
| `-o <path>` | 指定输出文件或目录路径 | `-o ./output.xlsx` |
| `-b` | 启用批处理模式（默认处理当前目录） | `-b` |

### 可选参数

| 参数 | 描述 | 示例 |
|------|------|------|
| `--sheet-name <name>` | 设置Excel工作表名称（默认：Data） | `--sheet-name MyData` |
| `--disable-auto-width` | 禁用自动列宽调整 | `--disable-auto-width` |

## 使用示例

### 示例1：单个文件转换

```bash
node json_to_excel.js -i ./data.json -o output.xlsx
```

### 示例2：单个文件转换（自定义工作表名称）

```bash
node json_to_excel.js -i ./data.json -o output.xlsx --sheet-name MySheet
```

### 示例3：单个文件转换（禁用自动列宽）

```bash
node json_to_excel.js -i ./data.json -o output.xlsx --disable-auto-width
```

### 示例4：批处理当前目录

```bash
node json_to_excel.js -b -o ./Outputs
```

### 示例5：批处理指定目录

```bash
node json_to_excel.js -b -i ./Examples -o ./Outputs
```

### 示例6：批处理指定目录（自定义工作表名称）

```bash
node json_to_excel.js -b -i ./Examples -o ./Outputs --sheet-name MyData
```

## 支持的数据格式

### 1. 基本JSON对象

```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}
```

### 2. 嵌套JSON对象

```json
{
  "person": {
    "name": "John Doe",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    }
  }
}
```

### 3. 包含数组的JSON对象

```json
{
  "students": [
    { "name": "Alice", "age": 20 },
    { "name": "Bob", "age": 21 },
    { "name": "Charlie", "age": 22 }
  ]
}
```

### 4. 时序数据（如Azure监控数据）

```json
{
  "values": [
    {
      "starttime": "2024-01-01T00:00:00Z",
      "endtime": "2024-01-01T00:10:00Z",
      "value": [
        {
          "id": "CPU_Usage",
          "name": { "value": "CPU Usage" },
          "timeseries": [
            {
              "data": [
                { "time": "2024-01-01T00:00:00Z", "average": 25.5 },
                { "time": "2024-01-01T00:05:00Z", "average": 30.2 },
                { "time": "2024-01-01T00:10:00Z", "average": 28.7 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 数据处理逻辑

1. **时序数据检测**：工具会自动检测包含时间字段（如`time`、`timestamp`、`starttime`）的JSON结构
2. **时序数据处理**：将时序数据展开为多行，每行包含一个时间点的数值
3. **通用扁平化**：对于非时序数据，使用递归扁平化算法处理嵌套结构
4. **数组展开**：自动检测根对象中的数组字段，并将其展开为多行

## 输出格式

### 时序数据输出

对于时序数据，输出的Excel文件将包含以下列（根据实际数据结构调整）：

| startTime | endTime | metricId | metricName | time | average |
|-----------|---------|----------|------------|------|---------|
| 2024-01-01T00:00:00Z | 2024-01-01T00:10:00Z | CPU_Usage | CPU Usage | 2024-01-01T00:00:00Z | 25.5 |
| 2024-01-01T00:00:00Z | 2024-01-01T00:10:00Z | CPU_Usage | CPU Usage | 2024-01-01T00:05:00Z | 30.2 |
| 2024-01-01T00:00:00Z | 2024-01-01T00:10:00Z | CPU_Usage | CPU Usage | 2024-01-01T00:10:00Z | 28.7 |

### 通用JSON输出

对于通用JSON对象，输出的Excel文件将包含扁平化后的字段：

| person.name | person.address.street | person.address.city | person.address.country |
|-------------|----------------------|---------------------|------------------------|
| John Doe | 123 Main St | New York | USA |

### 数组展开输出

对于包含数组的JSON对象，输出的Excel文件将包含以下列（以students数组为例）：

| studentsIndex | name | age |
|---------------|------|-----|
| 0 | Alice | 20 |
| 1 | Bob | 21 |
| 2 | Charlie | 22 |

## 注意事项

1. **文件路径**：确保输入路径和输出路径正确，避免使用特殊字符
2. **文件权限**：确保对输入文件有读取权限，对输出目录有写入权限
3. **大型文件**：处理大型JSON文件时可能需要较长时间和较多内存
4. **Excel限制**：Excel有行数和列数限制（约100万行，16000列），超出限制的部分将无法保存
5. **文件锁定**：确保输出Excel文件没有被其他程序（如Excel）打开，否则会导致文件锁定错误
6. **JSON格式**：确保输入的JSON文件格式正确，否则会导致解析错误

## 常见问题

### Q: 转换过程中出现"JSON语法错误"怎么办？
A: 请检查输入的JSON文件格式是否正确，确保所有括号、引号等都正确匹配。

### Q: 转换后Excel文件中没有数据怎么办？
A: 请检查输入的JSON文件是否为空，或者数据结构是否与预期不符。

### Q: 转换后Excel文件中的列名过长怎么办？
A: 对于嵌套较深的JSON结构，扁平化后的字段名可能较长。可以考虑调整JSON结构或手动编辑Excel文件。

### Q: 批量转换时部分文件转换失败怎么办？
A: 请检查失败的JSON文件格式是否正确，以及是否有读取权限。工具会输出详细的错误信息。

## 依赖

- [xlsx](https://www.npmjs.com/package/xlsx) - Excel文件操作库

## 许可证

ISC

## 更新日志

### v1.0.0 (2025-12-31)
- 初始版本发布
- 支持复杂嵌套JSON结构处理
- 支持时序数据自动检测和处理
- 支持单个文件和批量转换
- 提供灵活的命令行参数配置