# 测试图片目录

此目录用于存放医疗报告测试图片。

## 图片要求

1. 图片格式：
   - 支持 JPG/JPEG
   - 支持 PNG
   - 建议分辨率不低于 1200x1600

2. 图片内容：
   - 标准医疗检验报告单
   - 包含清晰的指标名称、数值和参考范围
   - 避免包含患者隐私信息

## 示例图片命名规范

- `blood_test_normal.jpg` - 正常血常规报告
- `blood_test_abnormal.jpg` - 异常血常规报告
- `liver_function.jpg` - 肝功能检查报告
- `kidney_function.jpg` - 肾功能检查报告

## 注意事项

1. 请确保图片清晰度足够，文字可读
2. 建议使用不同类型的检验报告进行测试
3. 测试图片应包含正常值和异常值的情况
4. 图片大小建议控制在 2MB 以内

## 目录结构

```
test-images/
├── blood_test_normal.jpg
├── blood_test_abnormal.jpg
├── liver_function.jpg
└── kidney_function.jpg
```

## 使用说明

1. 将测试图片放入此目录
2. 确保图片符合上述命名规范
3. 运行测试脚本时指定此目录下的图片路径
