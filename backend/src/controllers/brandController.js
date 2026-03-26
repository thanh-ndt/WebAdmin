const Brand = require('../models/Brand');

// GET /api/brands - Lấy danh sách thương hiệu
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/brands/:id - Lấy chi tiết thương hiệu
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/brands - Thêm thương hiệu
exports.createBrand = async (req, res) => {
  try {
    const { name, country, description } = req.body;

    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Thương hiệu đã tồn tại' });
    }

    const brand = new Brand({ name, country, description });
    await brand.save();

    res.status(201).json({ message: 'Thêm thương hiệu thành công', brand });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm thương hiệu', error: error.message });
  }
};

// PUT /api/brands/:id - Cập nhật thương hiệu
exports.updateBrand = async (req, res) => {
  try {
    const { name, country, description } = req.body;
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, country, description },
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    res.json({ message: 'Cập nhật thành công', brand });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

// DELETE /api/brands/:id - Xóa thương hiệu
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    res.json({ message: 'Xóa thương hiệu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa thương hiệu', error: error.message });
  }
};
