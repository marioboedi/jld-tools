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
  const [searchTerm, setSearchTerm] = useState('')
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
  const filteredList = list
  .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
  .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))


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

      <div className="search-container">
        <label htmlFor="product-search">Search Product: </label>
        <input
          type="text"
          id="product-search"
          placeholder="Enter product name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset ke halaman 1 saat pencarian berubah
          }}
        />
      </div>


      <p className="product-count">Total Products: {filteredList.length}</p>


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
            <p>{'Rp ' + item.price.toLocaleString('id-ID')}</p>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="modal-close-button"
              onClick={() => setEditProduct(null)}
            >
              &times;
            </span>
            <h2>Edit Product</h2>

            <div className="form-group">
              <label htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                type="text"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                value={editProduct.category}
                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
              >
                {uniqueCategories
                  .filter((category) => category !== 'All')
                  .map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>


            <div className="form-group">
              <label htmlFor="edit-price">Price</label>
              <input
                id="edit-price"
                type="number"
                min="0"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-stock">Stock</label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                value={editProduct.stock}
                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-image">Image</label>
              <input
                id="edit-image"
                type="file"
                onChange={(e) => setEditProduct({ ...editProduct, imageFile: e.target.files[0] })}
              />
            </div>

            <div className="modal-buttons">
              <button className="submit-button" onClick={submitEditProduct}>Submit</button>
              {/* <button className="cancel-button" onClick={() => setEditProduct(null)}>Cancel</button> */}
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default List
