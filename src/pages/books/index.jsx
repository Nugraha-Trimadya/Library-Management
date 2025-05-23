import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaPlus, FaSync, FaSort, FaCheck } from 'react-icons/fa';
import { Plus, Search, Filter, Check, X } from 'react-feather';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm bg-gray-700/30 transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 p-6 relative z-50 transform transition-all shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Card Components
const Card = ({ className, children }) => (
  <div className={`bg-white rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className, children }) => (
  <h2 className={`text-xl font-bold ${className}`}>
    {children}
  </h2>
);

const CardContent = ({ children }) => (
  <div className="p-6 pt-0">
    {children}
  </div>
);

// Table Components
const Table = ({ children }) => (
  <table className="w-full">
    {children}
  </table>
);

const TableHeader = ({ children }) => (
  <thead>
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody>
    {children}
  </tbody>
);

const TableRow = ({ className, children }) => (
  <tr className={className}>
    {children}
  </tr>
);

const TableHead = ({ className, children }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ className, children }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
    {children}
  </td>
);

// Button Component
const Button = ({ className, children, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${className}`}
  >
    {children}
  </button>
);

// Input Component
const Input = ({ className, placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 ${className}`}
  />
);

// Select Component
const Select = ({ className, value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 ${className}`}
  >
    {children}
  </select>
);

// Badge Component
const Badge = ({ className, children }) => (
  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${className}`}>
    {children}
  </span>
);

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    tahun: '',
    penerbit: ''
  });
  const [formData, setFormData] = useState({
    no_rak: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    tahun_terbit: '',
    stok: '',
    detail: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://45.64.100.26:88/perpus-api/public/api/buku');
      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else if (response.data && response.data.data) {
        setBooks(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch books data',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedBook 
        ? `http://45.64.100.26:88/perpus-api/public/api/buku/${selectedBook.id}`
        : 'http://45.64.100.26:88/perpus-api/public/api/buku';
      
      const method = selectedBook ? 'put' : 'post';
      
      await axios[method](url, formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Book successfully ${selectedBook ? 'updated' : 'created'}!`,
      });
      
      setShowModal(false);
      setFormData({
        no_rak: '',
        judul: '',
        pengarang: '',
        penerbit: '',
        tahun_terbit: '',
        stok: '',
        detail: ''
      });
      fetchBooks();
    } catch (error) {
      console.error('Error submitting book:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to submit book data',
      });
    }
  };
  // Enhanced Form Component with better validation and formatting
  const BookForm = ({ onSubmit, initialData, isEdit }) => {
    const currentYear = new Date().getFullYear();
    const [localFormData, setLocalFormData] = useState(initialData || {
      no_rak: '',
      judul: '',
      pengarang: '',
      penerbit: '',
      tahun_terbit: '',
      stok: '',
      detail: ''
    });
    
    useEffect(() => {
      if (initialData) {
        setLocalFormData(initialData);
      }
    }, [initialData]);
    
    const capitalizeWords = (str) => {
      if (!str) return '';
      return str.split(/[\s-.]/)
        .map(word => {
          if (!word) return '';
          if (word.toUpperCase() === word) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    };

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      let formattedValue = value;

      // Apply specific formatting rules
      if (['judul', 'pengarang', 'penerbit'].includes(name)) {
        formattedValue = capitalizeWords(value);
      }

      setLocalFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    };

    const handleLocalSubmit = (e) => {
      e.preventDefault();
      onSubmit(e, localFormData);
    };

    return (
      <form onSubmit={handleLocalSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rak</label>
            <input
              type="text"
              name="no_rak"
              value={localFormData.no_rak}
              onChange={handleLocalChange}
              placeholder="Contoh: A-01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Format: Huruf-Angka (A-01, B-02, dst)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
            <input
              type="text"
              name="judul"
              value={localFormData.judul}
              onChange={handleLocalChange}
              placeholder="Masukkan judul buku"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengarang</label>
            <input
              type="text"
              name="pengarang"
              value={localFormData.pengarang}
              onChange={handleLocalChange}
              placeholder="Masukkan nama pengarang"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
            <input
              type="text"
              name="penerbit"
              value={localFormData.penerbit}
              onChange={handleLocalChange}
              placeholder="Masukkan nama penerbit"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
            <input
              type="number"
              name="tahun_terbit"
              value={localFormData.tahun_terbit}
              onChange={handleLocalChange}
              min="1900"
              max={currentYear}
              placeholder={`1900-${currentYear}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Tahun tidak boleh lebih dari tahun sekarang</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Buku</label>
            <input
              type="number"
              name="stok"
              value={localFormData.stok}
              onChange={handleLocalChange}
              min="0"
              placeholder="Masukkan jumlah stok"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Detail Buku</label>
            <textarea
              name="detail"
              value={localFormData.detail}
              onChange={handleLocalChange}
              rows="4"
              placeholder="Masukkan deskripsi atau ringkasan buku"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            {isEdit ? 'Perbarui' : 'Tambah'} Buku
          </button>
        </div>
      </form>
    );
  };

  // Enhanced Detail View
  const DetailView = ({ book }) => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-xl text-gray-900 mb-4">{book?.judul}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nomor Rak</p>
              <p className="mt-1 text-base text-gray-900">{book?.no_rak}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pengarang</p>
              <p className="mt-1 text-base text-gray-900">{book?.pengarang}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Penerbit</p>
              <p className="mt-1 text-base text-gray-900">{book?.penerbit}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tahun Terbit</p>
              <p className="mt-1 text-base text-gray-900">{book?.tahun_terbit}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Stok</p>
              <p className="mt-1 text-base text-gray-900">{book?.stok} buku</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className={`mt-1 text-base ${parseInt(book?.stok) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseInt(book?.stok) > 0 ? 'Tersedia' : 'Tidak Tersedia'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Detail Buku</p>
          <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{book?.detail || 'Tidak ada detail'}</p>
        </div>
      </div>
    </div>
  );

        {/* Update Modal Content */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === 'create' ? 'Tambah Buku Baru' : modalType === 'edit' ? 'Edit Buku' : 'Detail Buku'}
        >
          {modalType === 'detail' ? (
            <DetailView book={selectedBook} />
          ) : (
            <BookForm
              onSubmit={handleSubmit}
              initialData={selectedBook}
              isEdit={modalType === 'edit'}
            />
          )}
        </Modal>

  const openCreateModal = () => {
    setSelectedBook(null);
    setModalType('create');
    setFormData({
      no_rak: '',
      judul: '',
      pengarang: '',
      penerbit: '',
      tahun_terbit: '',
      stok: '',
      detail: ''
    });
    setShowModal(true);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      no_rak: book.no_rak,
      judul: book.judul,
      pengarang: book.pengarang,
      penerbit: book.penerbit,
      tahun_terbit: book.tahun_terbit,
      stok: book.stok,
      detail: book.detail
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDetail = (book) => {
    setSelectedBook(book);
    setModalType('detail');
    setShowModal(true);
  };

  const handleDelete = (book) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${book.judul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBook(book);
      }
    });
  };

  const deleteBook = async (book) => {
    try {
      await axios.delete(`http://45.64.100.26:88/perpus-api/public/api/buku/${book.id}`);
      Swal.fire('Deleted!', 'Book has been deleted.', 'success');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      Swal.fire('Error!', 'Failed to delete book.', 'error');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter and search books
  const filteredBooks = books.filter(book => {
    const matchesSearch = (
      book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penerbit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesFilters = (
      (!filters.tahun || book.tahun_terbit.toString() === filters.tahun) &&
      (!filters.penerbit || book.penerbit.toLowerCase().includes(filters.penerbit.toLowerCase()))
    );

    return matchesSearch && matchesFilters;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilters, setActiveFilters] = useState(false);

  // Handle row selection
  const handleSelectRow = (id, isChecked) => {
    if (isChecked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedRows(currentItems.map(book => book.id));
    } else {
      setSelectedRows([]);
    }
  };

  return (
      <div className="flex-1 overflow-auto pl-6">
        <Card className="my-6 mr-6 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-bold">Book Management</CardTitle>
            <Button 
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={openCreateModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Book
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Search books..." 
                    className="pl-10 bg-white" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                    Ctrl + K
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select 
                    className="w-48 bg-white"
                    value={filters.tahun}
                    onChange={(e) => {
                      setFilters({ ...filters, tahun: e.target.value });
                      setActiveFilters(e.target.value !== '' || filters.penerbit !== '');
                    }}
                  >
                    <option value="">Filter by Year</option>
                    {[...new Set(books.map(book => book.tahun_terbit))].sort().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                  <Select 
                    className="w-48 bg-white"
                    value={filters.penerbit}
                    onChange={(e) => {
                      setFilters({ ...filters, penerbit: e.target.value });
                      setActiveFilters(e.target.value !== '' || filters.tahun !== '');
                    }}
                  >
                    <option value="">Filter by Publisher</option>
                    {[...new Set(books.map(book => book.penerbit))].sort().map(publisher => (
                      <option key={publisher} value={publisher}>{publisher}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Active filters indicator */}
              <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md w-fit">
                <Filter size={14} className="mr-2" />
                {activeFilters ? 'Active filters' : 'No active filters'}
              </div>

              {/* Table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          checked={selectedRows.length === currentItems.length && currentItems.length > 0}
                        />
                      </TableHead>
                      <TableHead className="w-16">NO</TableHead>
                      <TableHead className="w-24">
                        <div className="flex items-center">
                          NO RAK
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          JUDUL
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          PENGARANG
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          PENERBIT
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          TAHUN
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          STOK
                          <Filter size={14} className="ml-1 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>DETAIL</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((book, index) => (
                      <TableRow key={book.id} className="hover:bg-gray-50">
                        <TableCell className="text-center">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedRows.includes(book.id)}
                            onChange={(e) => handleSelectRow(book.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                        <TableCell>{book.no_rak}</TableCell>
                        <TableCell className="font-medium">{book.judul}</TableCell>
                        <TableCell>{book.pengarang}</TableCell>
                        <TableCell>{book.penerbit}</TableCell>
                        <TableCell>{book.tahun_terbit}</TableCell>
                        <TableCell>{book.stok}</TableCell>
                        <TableCell>
                          {parseInt(book.stok) > 0 ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Check size={14} className="mr-1" /> Available
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              <X size={14} className="mr-1" /> Out of Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {book.detail || 'No details'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleDetail(book)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <FaEye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(book)}
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Edit"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(book)}
                              className="text-rose-600 hover:text-rose-900"
                              title="Delete"
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBooks.length)} of {filteredBooks.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage > 3 ? currentPage - 3 + i + 1 : i + 1;
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          className={`${
                            currentPage === pageNum
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  <Button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Component */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === 'create' ? 'Tambah Buku Baru' : modalType === 'edit' ? 'Edit Buku' : 'Detail Buku'}
        >
          {modalType === 'detail' ? (
            <DetailView book={selectedBook} />
          ) : (
            <BookForm
              onSubmit={handleSubmit}
              initialData={selectedBook}
              isEdit={modalType === 'edit'}
            />
          )}
        </Modal>
      </div>
  );
}
