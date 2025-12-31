# JSON转Excel工具项目需求与实现分析

## 1. 项目概述

本项目旨在开发一套完整的JSON数据处理工具集，包括JSON转Excel转换功能和JSON数据匿名化功能，支持复杂嵌套数据结构和批量处理能力。

## 2. 功能需求

### 2.1 JSON数据匿名化
- **目标**：对JSON文件中的敏感ID数据进行隐私化处理
- **处理对象**：`./Examples`目录中的所有JSON文件
- **敏感字段**：
  - meterId
  - productId
  - skuId
  - serviceId
  - CustomerEntityId
  - subscription相关字段中的id值
- **要求**：
  - 保持数据结构完整性
  - 相同原始ID映射到相同匿名ID
  - 支持单个文件和目录批量处理

### 2.2 JSON转Excel转换工具

#### 2.2.1 json_to_excel.js工具
- **参数模式**：使用标志参数
  - `-i`：输入JSON文件路径
  - `-o`：输出Excel文件路径
  - `-b`：批处理模式，后跟输入目录
- **功能**：
  - 支持单个JSON文件转换
  - 支持目录批量转换
  - 处理复杂嵌套结构：对象嵌套数组，再嵌套对象，最后一层时序数组
  - 自动检测和处理时序数据
  - 保持数据完整性

#### 2.2.2 main.js工具
- **参数模式**：使用位置参数
  - 单个文件：`node main.js <input.json> <output.xlsx>`
  - 目录批处理：`node main.js <input_dir> <output_dir>`
- **功能**：
  - 与json_to_excel.js类似的转换功能
  - 支持自定义工作表名称
  - 支持禁用自动列宽
  - 处理复杂JSON结构

### 2.3 辅助功能
- **文件管理**：删除已生成的Excel文件
- **测试**：对所有工具进行功能测试
- **文档**：为所有工具生成详细使用说明
- **版本控制**：创建Git仓库并推送到GitHub

## 3. 非功能需求

- **性能**：处理大型JSON文件（>10MB）时保持良好性能
- **可靠性**：完善的错误处理和友好的错误提示
- **易用性**：简洁明了的命令行界面
- **可维护性**：模块化设计，清晰的代码结构
- **兼容性**：支持各种JSON数据格式，包括嵌套结构和时序数据

## 4. 技术要求

- **开发语言**：Node.js
- **核心库**：
  - xlsx：用于Excel文件生成
  - fs：文件系统操作
  - path：路径处理
  - crypto：哈希算法（用于匿名化）
- **版本控制**：Git
- **代码托管**：GitHub

## 5. 项目结构

```
├── json_anonymizer.js    # JSON数据匿名化工具
├── json_to_excel.js      # JSON转Excel工具（标志参数模式）
├── main.js               # JSON转Excel工具（位置参数模式）
├── README.md             # 项目总说明
├── ANONYMIZER_README.md  # 匿名化工具说明
├── MAIN_README.md        # main.js工具说明
├── package.json          # 项目依赖配置
├── .gitignore            # Git忽略文件配置
├── Examples/             # 示例JSON文件目录
└── Outputs/              # Excel输出目录
```

## 6. 代码实现逻辑

### 6.1 JSON数据匿名化 (json_anonymizer.js)

**核心设计思路**：
1. **递归遍历**：使用递归函数遍历JSON结构的所有层级
2. **敏感字段识别**：通过字段名匹配识别需要匿名化的ID字段
3. **一致性映射**：使用哈希算法生成固定长度的匿名ID，确保相同原始ID映射到相同匿名ID
4. **批量处理**：支持单个文件和目录级别的批量处理

**关键函数**：
```javascript
function generateAnonymousId(originalId, fieldType) {
  // 使用哈希算法生成一致的匿名ID
}

function processJsonData(data) {
  // 递归处理JSON数据，替换敏感字段
}

function batchAnonymize(directoryPath) {
  // 批量处理目录中的所有JSON文件
}
```

### 6.2 JSON转Excel转换 (json_to_excel.js 和 main.js)

**核心设计思路**：
1. **数据结构分析**：自动识别JSON数据类型（时序数据、普通对象、数组）
2. **递归扁平化**：将嵌套JSON结构转换为平面表格结构
3. **时序数据处理**：专门处理包含时间戳的数组数据
4. **命令行参数处理**：支持不同风格的参数解析
5. **批量处理**：遍历目录中的所有JSON文件进行转换

**关键函数**：
```javascript
function flattenJSON(obj, prefix) {
  // 递归扁平化JSON对象
}

function processTimeSeriesData(jsonData) {
  // 处理时序数据，展开为多行
}

function jsonToExcel(jsonPath, outputPath, options) {
  // 主转换函数
}
```

## 7. 测试要求

### 7.1 功能测试
- **单个文件转换**：验证单个JSON文件转换为Excel的正确性
- **批量转换**：验证目录级批量转换功能
- **复杂结构处理**：验证嵌套对象、数组、时序数据的处理能力
- **匿名化功能**：验证敏感ID的正确替换和一致性

### 7.2 边界测试
- 空JSON文件
- 极大JSON文件（>10MB）
- 格式错误的JSON文件
- 各种嵌套层级的JSON结构

### 7.3 性能测试
- 转换10MB以上JSON文件的时间
- 批量转换10个以上JSON文件的总时间

## 8. 交付物

- **代码文件**：
  - json_anonymizer.js
  - json_to_excel.js
  - main.js
- **文档**：
  - README.md
  - ANONYMIZER_README.md
  - MAIN_README.md
  - PROJECT_REQUIREMENTS.md
- **示例数据**：Examples目录中的JSON文件
- **Git仓库**：https://github.com/fsyinghua/json-to-excel-nodejs

## 9. 项目实现分析

### 9.1 需求分析与架构设计

1. **需求分解**：将原始需求分解为数据匿名化、JSON转Excel、工具测试、文档生成等独立任务
2. **架构设计**：采用模块化设计，每个工具独立实现核心功能，同时保持API的一致性
3. **技术选型**：
   - 选择Node.js作为开发语言，利用其强大的文件处理能力
   - 使用xlsx库处理Excel文件生成
   - 采用递归算法处理嵌套JSON结构

### 9.2 核心功能实现

#### 9.2.1 JSON转Excel功能

**实现思路**：
1. **参数解析**：
   - json_to_excel.js：使用标志参数（-i, -o, -b）
   - main.js：使用位置参数
2. **数据处理流程**：
   - 读取JSON文件
   - 自动检测数据类型（时序数据/普通数据）
   - 时序数据：展开为多行记录
   - 普通数据：递归扁平化为键值对
   - 转换为Excel工作表
   - 保存为Excel文件
3. **批量处理**：
   - 遍历目录中的所有.json文件
   - 逐一转换并保存

**关键技术点**：
- 使用递归算法处理任意深度的嵌套结构
- 利用哈希表存储扁平化解构的结果
- 自动识别时序数据（包含time, timestamp等字段）
- 处理大型数组和复杂嵌套关系

#### 9.2.2 JSON数据匿名化功能

**实现思路**：
1. **敏感字段识别**：通过字段名匹配识别需要匿名化的ID字段
2. **匿名ID生成**：
   - 使用SHA-256哈希算法
   - 结合字段类型确保不同字段的相同ID生成不同匿名值
   - 格式化为UUID风格（anon-xxxx-xxxx-xxxx）
3. **批量处理**：
   - 遍历目录中的所有JSON文件
   - 逐一处理并保存为新文件

**关键技术点**：
- 递归遍历JSON结构的所有层级
- 使用哈希算法确保匿名ID的一致性
- 处理不同类型的敏感字段

### 9.3 问题与解决方案

1. **Excel文件删除错误**：
   - 问题：使用`Remove-Item -Recurse`时遇到文件占用错误
   - 解决方案：使用PowerShell循环逐个删除文件，添加错误处理

2. **UUID生成null错误**：
   - 问题：哈希值过短时，正则表达式匹配失败
   - 解决方案：使用字符串填充和子字符串操作确保UUID格式正确

3. **复杂嵌套结构处理**：
   - 问题：深层嵌套的JSON结构难以扁平化
   - 解决方案：使用递归算法和点表示法（如`parent.child[0].property`）表示嵌套关系

4. **时序数据识别**：
   - 问题：如何自动识别各种格式的时序数据
   - 解决方案：检查包含时间相关字段（time, timestamp, timeStamp等）的数组

## 10. 总结

本项目成功实现了完整的JSON数据处理工具集，包括：
1. JSON数据匿名化工具，保护敏感ID信息
2. 两个JSON转Excel工具，支持不同的命令行参数风格
3. 批量处理能力，提高工作效率
4. 完善的文档支持
5. 版本控制和代码托管

工具集能够处理复杂的嵌套JSON结构，包括对象嵌套数组、重复嵌套对象和时序数据，满足了用户的各种需求。