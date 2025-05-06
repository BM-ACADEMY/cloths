import React, { useEffect, useState } from 'react';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import Loading from '../components/Loading';
import ProductCardAdmin from '../components/ProductCardAdmin';

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Pagination,
  Stack
} from '@mui/material';

import { IoSearchOutline } from "react-icons/io5";

const ProductAdmin = () => {
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [search, setSearch] = useState("");

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: page,
          limit: 12,
          search: search
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage);
        setProductData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [page]);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Typography variant="h6" fontWeight="bold">Product</Typography>
        <TextField
          placeholder="Search product here..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ ml: 'auto', maxWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoSearchOutline size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading && <Loading />}

      <Box sx={{ px: 2, py: 3, backgroundColor: '#f0f4ff', borderRadius: 2 }}>
        <Box sx={{ minHeight: '55vh' }}>
          <Grid container spacing={2}>
            {productData.map((p, index) => (
              <Grid item xs={6} sm={3} md={2} key={p._id || index}>
                <ProductCardAdmin data={p} fetchProductData={fetchProductData} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Stack direction="row" justifyContent="center" mt={4}>
          <Pagination
            count={totalPageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default ProductAdmin;
