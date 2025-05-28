import React, { useEffect, useState } from 'react'
import { backendUrl } from '../../App'
import { toast } from 'react-toastify'
import axios from 'axios'
import { MdDeleteForever, MdEdit } from 'react-icons/md'
import './List.css'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editProduct, setEditProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const productsPerPage = 10

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list', {
        headers: { token },
      })

      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (_id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { _id },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditProduct(product)
  }

  const submitEditProduct = async () => {
    try {
      const formData = new FormData()
      formData.append('_id', editProduct._id)
      formData.append('name', editProduct.name)
      formData.append('price', editProduct.price)
      formData.append('category', editProduct.category)
      formData.append('description', editProduct.description)
      formData.append('stock', editProduct.stock);


      if (editProduct.imageFile) {
        formData.append('image', editProduct.imageFile)
      }

      const response = await axios.post(backendUrl + '/api/product/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token,
        },
      })

      if (response.data.success) {
        toast.success(response.data.message)
        setEditProduct(null)
        fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  // Filter category
  const uniqueCategories = ['All', ...new Set(list.map((item) => item.category))]
  const filteredList = selectedCategory === 'All' ? list : list.filter((item) => item.category === selectedCategory)

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredList.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredList.length / productsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div>
      <p className="product-title">Product List</p>

      {/* Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="category-filter">Filter by Category: </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setCurrentPage(1) // Reset ke halaman 1 saat filter berubah
          }}
        >
          {uniqueCategories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="product-list-container">
        <div className="product-table-title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="action-title">Action</b>
        </div>

        {currentProducts.map((item, index) => (
          <div key={index} className="product-row">
            <img src={item.image} alt="" className="product-image" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
            <p>{item.stock ?? '-'}</p> {/* Menampilkan stok atau "-" jika tidak tersedia */}

            <div className="product-actions">
              <MdEdit onClick={() => handleEditProduct(item)} className="product-action" />
              <MdDeleteForever
                onClick={() => removeProduct(item._id)}
                className="product-action"
              />
            </div>
          </div>
        ))}

        {/* Pagination Controls */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ==== FORM EDIT PRODUCT ==== */}
      {editProduct && (
        <div className="edit-form-container">
          <h3>Edit Product</h3>
          <input
            type="text"
            value={editProduct.name}
            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
            placeholder="Name"
          />
          <input
            type="text"
            value={editProduct.category}
            onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
            placeholder="Category"
          />
          <input
            type="number"
            value={editProduct.price}
            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
            placeholder="Price"
          />
          <textarea
            value={editProduct.description}
            onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
            placeholder="Description"
          />
          <input
            type="file"
            onChange={(e) =>
              setEditProduct({ ...editProduct, imageFile: e.target.files[0] })
            }
          />
          <input
            type="number"
            value={editProduct.stock}
            onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
            placeholder="Stock"
          />
          <button onClick={submitEditProduct}>Submit</button>
          <button onClick={() => setEditProduct(null)}>Cancel</button>
        </div>
      )}
    </div>
  )
}

export default List
