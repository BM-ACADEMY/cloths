import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
    size: []
  });
  
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector(state => state.product.allCategory);
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadImages = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageLoading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const responses = await Promise.all(uploadPromises);
      
      const newImageUrls = responses
        .filter(response => response?.data?.data?.url)
        .map(response => response.data.data.url);
      
      setData(prev => ({
        ...prev,
        image: [...prev.image, ...newImageUrls]
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...data.image];
    newImages.splice(index, 1);
    setData(prev => ({ ...prev, image: newImages }));
  };

  const handleRemoveCategory = (index) => {
    const newCategories = [...data.category];
    newCategories.splice(index, 1);
    setData(prev => ({ ...prev, category: newCategories }));
  };

  const handleRemoveSubCategory = (index) => {
    const newSubCategories = [...data.subCategory];
    newSubCategories.splice(index, 1);
    setData(prev => ({ ...prev, subCategory: newSubCategories }));
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;
    
    setData(prev => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: ""
      }
    }));
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    setData(prev => ({
      ...prev,
      size: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("data", data);

    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: data
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
          size: []
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="medium">Upload Product</Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            name="name"
            value={data.name}
            onChange={handleChange}
            required
          />
          
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            name="description"
            value={data.description}
            onChange={handleChange}
            required
          />
          
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>Images</Typography>
            <label htmlFor="productImages">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                  height: '96px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imageLoading ? <Loading /> : 'Upload Images (Multiple)'}
              </Button>
              <input
                type="file"
                id="productImages"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleUploadImages}
                multiple
              />
            </label>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              {data.image.map((img, index) => (
                <Box key={img+index} sx={{ position: 'relative', width: 80, height: 80 }}>
                  <img
                    src={img}
                    alt={img}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => setViewImageURL(img)}
                  />
                  <IconButton
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    onClick={() => handleDeleteImage(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectCategory}
              onChange={(e) => {
                const value = e.target.value;
                const category = allCategory.find(el => el._id === value);
                if (category) {
                  setData(prev => ({
                    ...prev,
                    category: [...prev.category, category]
                  }));
                  setSelectCategory("");
                }
              }}
              label="Category"
            >
              <MenuItem value="">Select Category</MenuItem>
              {allCategory.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </Select>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {data.category.map((c, index) => (
                <Chip
                  key={c._id+index}
                  label={c.name}
                  onDelete={() => handleRemoveCategory(index)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Sub Category</InputLabel>
            <Select
              value={selectSubCategory}
              onChange={(e) => {
                const value = e.target.value;
                const subCategory = allSubCategory.find(el => el._id === value);
                if (subCategory) {
                  setData(prev => ({
                    ...prev,
                    subCategory: [...prev.subCategory, subCategory]
                  }));
                  setSelectSubCategory("");
                }
              }}
              label="Sub Category"
            >
              <MenuItem value="">Select Sub Category</MenuItem>
              {allSubCategory.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </Select>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {data.subCategory.map((c, index) => (
                <Chip
                  key={c._id+index}
                  label={c.name}
                  onDelete={() => handleRemoveSubCategory(index)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </FormControl>
          
          <TextField
            label="Unit"
            variant="outlined"
            fullWidth
            name="unit"
            value={data.unit}
            onChange={handleChange}
            required
          />
          
          <TextField
            label="Number of Stock"
            variant="outlined"
            fullWidth
            type="number"
            name="stock"
            value={data.stock}
            onChange={handleChange}
            required
          />
          
          <TextField
            label="Price"
            variant="outlined"
            fullWidth
            type="number"
            name="price"
            value={data.price}
            onChange={handleChange}
            required
          />
          
          <TextField
            label="Discount"
            variant="outlined"
            fullWidth
            type="number"
            name="discount"
            value={data.discount}
            onChange={handleChange}
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Sizes</InputLabel>
            <Select
              multiple
              value={data.size}
              onChange={handleSizeChange}
              label="Sizes"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {['S', 'M', 'L', 'XL','2XL', '3XL'].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {Object.keys(data.more_details).map((k) => (
            <TextField
              key={k}
              label={k}
              variant="outlined"
              fullWidth
              value={data.more_details[k]}
              onChange={(e) => {
                const value = e.target.value;
                setData(prev => ({
                  ...prev,
                  more_details: {
                    ...prev.more_details,
                    [k]: value
                  }
                }));
              }}
              required
            />
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddField(true)}
            sx={{ width: 'fit-content' }}
          >
            Add Fields
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ py: 2 }}
          >
            Submit
          </Button>
        </form>
      </Box>
      
      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
      )}
      
      <Dialog open={openAddField} onClose={() => setOpenAddField(false)}>
        <DialogTitle>Add New Field</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Field Name"
            fullWidth
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddField(false)}>Cancel</Button>
          <Button onClick={handleAddField}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadProduct;