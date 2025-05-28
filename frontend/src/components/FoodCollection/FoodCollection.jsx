import React, { useContext, useState, useEffect } from 'react'
import './FoodCollection.css'
import { categoryItem } from '../../assets/assets'
import { FoodContext } from '../../context/FoodContext'
import ProductModal from '../ProductModal/ProductModal'

const FoodCollection = () => {
  const { products, addToCart } = useContext(FoodContext)
  const [category, setCategory] = useState("All")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Filter produk berdasarkan kategori
  const filteredProducts = products.filter(
    (product) =>
      category === "All" ||
      category.trim().toLowerCase() === product.category.trim().toLowerCase()
  )

  // Hitung produk yang akan ditampilkan per halaman
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Jumlah halaman
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Fungsi pindah halaman
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Fungsi Prev dan Next
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  // Reset halaman ke 1 saat ganti kategori
  useEffect(() => {
    setCurrentPage(1)
  }, [category])

  return (
    <div className="food_container">
      <div className='header_section'>
        <h1 className='text_center'>Discover Our Product</h1>
        <hr className='divider'/>
      </div>

      <div className='display_container'>
        <div className='category_section'>
          <h1>Explore Our Categories</h1>
          <ul className="category_list">
            {
              categoryItem.map((item, index) => (
                <li key={index} 
                  onClick={() => setCategory((prev) => (prev === item.category_title ? "All" : item.category_title))}
                  className={category === item.category_title ? "active" : ""}>
                  {item.category_title}
                </li>
              ))
            }
          </ul>
        </div>

        <div className='grid_display'>
          {
            currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product._id} className='product_card'>
                  <div className="product-image" onClick={() => openModal(product)} style={{ cursor: 'pointer' }}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <h3 onClick={() => openModal(product)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                  <div className="price-add">
                    <p>Rp.{product.price.toLocaleString('id-ID')}</p>
                    <button 
                      onClick={() => addToCart(product._id)} 
                      disabled={product.stock === 0}
                      style={{ 
                        backgroundColor: product.stock === 0 ? 'gray' : '', 
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add To Cart'}
                    </button>

                  </div>
                </div>
              ))
            ) : (
              <p>No products available</p>
            )
          }
        </div>
      </div>

      {/* Pagination dipindahkan ke luar display_container */}
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={currentPage === i + 1 ? "active-page" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          addToCart={addToCart}
        />
      )}
    </div>
  )
}

export default FoodCollection
