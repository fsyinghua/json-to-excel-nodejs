# json_anonymizer.js - JSON数据匿名化工具说明

## 概述

`json_anonymizer.js`是一个用于匿名化JSON文件中敏感数据的工具，特别针对ID类数据（如meterId、productId、skuId等）进行安全替换，确保数据结构完整性的同时保护隐私信息。

## 主要功能

- **敏感ID识别**：自动识别并匿名化常见的ID字段
- **一致性映射**：相同的原始ID始终映射到相同的匿名ID
- **递归处理**：支持深层嵌套的JSON结构
- **批量处理**：支持单个文件和整个目录的批量匿名化
- **哈希算法**：使用安全的哈希算法生成匿名ID
- **数据结构保持**：保持原始JSON的结构和格式不变

## 安装要求

- Node.js 12.0或更高版本

## 支持的敏感字段

工具自动识别并匿名化以下类型的ID字段：

- meterId
- productId
- skuId
- serviceId
- CustomerEntityId
- 包含"subscription"的字段中的"id"值

## 命令行用法

### 基本语法

```bash
node json_anonymizer.js <input> [output]
```

### 使用模式

#### 1. 单个文件匿名化
```bash
node json_anonymizer.js input.json output.json
```

#### 2. 目录批量匿名化
```bash
node json_anonymizer.js ./input_dir
```

批量处理时，匿名化后的文件将保存在同一目录下，文件名格式为：`anonymous_<original_filename>`

## 使用示例

### 单个文件匿名化
```bash
node json_anonymizer.js ./Examples/data.json ./Examples/anonymous_data.json
```

### 目录批量匿名化
```bash
node json_anonymizer.js ./Examples
```

## 工作原理

### 匿名ID生成

工具使用哈希算法生成一致的匿名ID：

1. 对原始ID和字段类型进行组合
2. 使用SHA-256哈希算法生成摘要
3. 截取前32个字符并格式化为UUID风格
4. 添加"anon-"前缀标识

示例：
- 原始ID: "123456789"
- 字段类型: "meterId"
- 匿名ID: "anon-abc123de-f456-7890-1234-56789abcdef0"

### 递归处理逻辑

1. 遍历JSON对象的所有属性
2. 检查属性名是否为敏感ID字段
3. 如果是敏感字段，生成并替换为匿名ID
4. 如果属性值是对象或数组，递归处理
5. 保持非敏感数据不变

## API参考

### 导出函数

#### generateAnonymousId(originalId, fieldType)

生成匿名ID的核心函数

- **originalId**：原始ID值
- **fieldType**：字段类型（用于保持一致性）
- **返回值**：生成的匿名ID字符串

#### processJsonData(data)

递归处理JSON数据，替换敏感字段

- **data**：要处理的JSON数据（对象或数组）
- **返回值**：匿名化后的JSON数据

#### anonymizeFile(inputPath, outputPath)

匿名化单个JSON文件

- **inputPath**：输入JSON文件路径
- **outputPath**：输出JSON文件路径
- **返回值**：布尔值，表示操作是否成功

#### batchAnonymize(directoryPath)

批量匿名化目录中的所有JSON文件

- **directoryPath**：包含JSON文件的目录路径
- **返回值**：布尔值，表示操作是否成功

## 注意事项

1. 匿名化是单向操作，无法恢复原始数据
2. 相同的原始ID会生成相同的匿名ID，确保数据一致性
3. 支持嵌套深度不限的JSON结构
4. 保持原始JSON的格式和缩进不变
5. 处理大文件时可能需要较长时间

## 错误处理

工具提供了完善的错误处理机制：
- 文件不存在检测
- JSON格式验证
- 读写权限检查
- 空文件处理
- 目录访问权限检查

## 应用场景

- **数据共享**：在不暴露敏感信息的情况下共享数据
- **测试环境**：为测试环境提供真实结构的匿名数据
- **数据分析**：在保护隐私的前提下进行数据分析
- **合规要求**：满足数据隐私法规要求

## 安全说明

- 使用SHA-256哈希算法生成匿名ID，具有较高的安全性
- 匿名化过程在本地进行，不涉及网络传输
- 不存储原始ID与匿名ID的映射关系
- 生成的匿名ID长度固定，格式统一

## 与其他工具的集成

可以与`json_to_excel.js`和`main.js`工具配合使用：

1. 先使用`json_anonymizer.js`匿名化敏感数据
2. 再使用转换工具将匿名化后的JSON转换为Excel

```bash
# 匿名化数据
node json_anonymizer.js data.json anonymous_data.json

# 转换为Excel
node json_to_excel.js -i anonymous_data.json -o output.xlsx
```