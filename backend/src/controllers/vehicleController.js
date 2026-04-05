const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');
const { deleteFromCloudinary, extractPublicId } = require('../congfig/cloudinaryVehicle');

// Helper to resolve vehicle model by ID or name
const resolveVehicleModel = async (modelInput) => {
  if (!modelInput) return null;
  
  // Check if it's a valid ObjectId
  if (require('mongoose').Types.ObjectId.isValid(modelInput)) {
    return modelInput;
  }
  
  // If it's a string name, search for it or create it
  let model = await VehicleModel.findOne({ name: { $regex: new RegExp(`^${modelInput.trim()}$`, 'i') } });
  if (!model) {
    model = new VehicleModel({ name: modelInput.trim() });
    await model.save();
  }
  return model._id;
};

// GET /api/vehicles - Lấy danh sách xe
exports.getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, brand, category, status } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (status) query.status = status;

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate('brand', 'name')
      .populate('vehicleModel', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      vehicles,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/vehicles/:id - Lấy chi tiết xe
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('brand', 'name')
      .populate('vehicleModel', 'name');

    if (!vehicle) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/vehicles - Thêm xe mới (với upload ảnh Cloudinary)
exports.createVehicle = async (req, res) => {
  try {
    const {
      name, brand, vehicleModel, category, engineCapacity,
      manufacture, description, specifications, price, status, stockQuantity,
      isPublished
    } = req.body;

    // Lấy URLs ảnh từ files đã upload lên Cloudinary
    const images = req.files ? req.files.map(file => file.path) : [];

    const resolvedModelId = await resolveVehicleModel(vehicleModel);

    const vehicle = new Vehicle({
      name, brand, vehicleModel: resolvedModelId, category, engineCapacity,
      manufacture, description,
      specifications: specifications ? JSON.parse(specifications) : {},
      price, status, stockQuantity, images,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    await vehicle.save();

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('brand', 'name')
      .populate('vehicleModel', 'name');

    res.status(201).json({ message: 'Thêm xe thành công', vehicle: populatedVehicle });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm xe', error: error.message });
  }
};

// PUT /api/vehicles/:id - Cập nhật xe
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    const {
      name, brand, vehicleModel, category, engineCapacity,
      manufacture, description, specifications, price, status,
      stockQuantity, removedImages, isPublished
    } = req.body;

    // Xóa ảnh cũ khỏi Cloudinary nếu có
    if (removedImages) {
      const imagesToRemove = JSON.parse(removedImages);
      for (const imageUrl of imagesToRemove) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      // Loại bỏ ảnh đã xóa khỏi danh sách
      vehicle.images = vehicle.images.filter(img => !imagesToRemove.includes(img));
    }

    // Thêm ảnh mới từ upload
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      vehicle.images = [...vehicle.images, ...newImages];
    }

    // Cập nhật các field khác
    if (name) vehicle.name = name;
    if (brand) vehicle.brand = brand;
    if (vehicleModel) {
      vehicle.vehicleModel = await resolveVehicleModel(vehicleModel);
    }
    if (category) vehicle.category = category;
    if (engineCapacity !== undefined) vehicle.engineCapacity = engineCapacity;
    if (manufacture) vehicle.manufacture = manufacture;
    if (description !== undefined) vehicle.description = description;
    if (specifications) vehicle.specifications = JSON.parse(specifications);
    if (price !== undefined) vehicle.price = price;
    if (status) vehicle.status = status;
    if (stockQuantity !== undefined) vehicle.stockQuantity = stockQuantity;
    if (isPublished !== undefined) vehicle.isPublished = isPublished;

    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('brand', 'name')
      .populate('vehicleModel', 'name');

    res.json({ message: 'Cập nhật xe thành công', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật xe', error: error.message });
  }
};

// DELETE /api/vehicles/:id - Xóa xe
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    // Xóa tất cả ảnh trên Cloudinary
    for (const imageUrl of vehicle.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa xe thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa xe', error: error.message });
  }
};

// GET /api/vehicles/stats - Lấy thống kê xe
exports.getVehicleStats = async (req, res) => {
  try {
    const [total, available, outOfStock, discontinued, hidden] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'available' }),
      Vehicle.countDocuments({ status: 'out_of_stock' }),
      Vehicle.countDocuments({ status: 'discontinued' }),
      Vehicle.countDocuments({ isPublished: false }),
    ]);

    res.json({ total, available, outOfStock, discontinued, hidden });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê xe', error: error.message });
  }
};
