import React from 'react'
import './ProductModal.css'

const ProductModal = ({ product, onClose, addToCart }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={product.image} alt={product.name} style={{ 
                width: '100%', 
                maxHeight: '250px',  // maksimal tinggi 250px, sesuaikan sesuai kebutuhan
                objectFit: 'contain', // supaya gambar tetap proporsional dan tidak terpotong
                borderRadius: '8px' 
            }} />
        <div className='product-detail'>
          <h2>{product.name}</h2>
          <p>{product.description || 'No description available.'}</p>
          <p><strong>Price:</strong> Rp.{product.price.toLocaleString('id-ID')}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? product.stock : "Out of Stock"}</p>

          <button
            onClick={() => addToCart(product._id)}
            disabled={product.stock === 0}
            style={{ backgroundColor: product.stock === 0 ? 'gray' : '' }}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
