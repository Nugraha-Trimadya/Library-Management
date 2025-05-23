import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaSearch, FaMoneyBillWave, FaCheck, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant';

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

// Component for statistics cards
const StatsCard = ({ icon: Icon, title, value, className }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${className}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const RestorationPage = () => {
  const [fines, setFines] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFine, setSelectedFine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const getToken = localStorage.getItem('token');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [finesRes, membersRes, booksRes] = await Promise.all([
          axios.get(`${API_URL}denda`, {
            headers: {
              Authorization: `Bearer ${getToken}`,
              Accept: 'application/json'
            }
          }),
          axios.get(`${API_URL}member`, {
            headers: {
              Authorization: `Bearer ${getToken}`,
              Accept: 'application/json'
            }
          }),
          axios.get(`${API_URL}buku`, {
            headers: {
              Authorization: `Bearer ${getToken}`,
              Accept: 'application/json'
            }
          })
        ]);

        setFines(finesRes.data.data || []);
        setFilteredData(finesRes.data.data || []);
        setMembers(membersRes.data || []);
        setBooks(booksRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken, navigate]);

  // Handle search and filtering
  useEffect(() => {
    let filtered = fines;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(fine => {
        const member = members.find(m => m.id === fine.id_member);
        const book = books.find(b => b.id === fine.id_buku);
        return (
          member?.nama?.toLowerCase().includes(search) ||
          book?.judul?.toLowerCase().includes(search) ||
          fine.jenis_denda?.toLowerCase().includes(search)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(fine => fine.status === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fines, members, books]);

  const handlePayFine = async (fine) => {
    try {
      await Swal.fire({
        title: 'Konfirmasi Pembayaran',
        text: `Proses pembayaran denda sebesar Rp ${fine.jumlah_denda.toLocaleString('id-ID')}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Ya, Proses',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.put(`${API_URL}denda/${fine.id}`, {
            ...fine,
            status: 'Sudah Dibayar'
          }, {
            headers: {
              Authorization: `Bearer ${getToken}`,
              Accept: 'application/json'
            }
          });

          // Refresh data
          const response = await axios.get(`${API_URL}denda`, {
            headers: {
              Authorization: `Bearer ${getToken}`,
              Accept: 'application/json'
            }
          });

          setFines(response.data.data || []);
          setFilteredData(response.data.data || []);

          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Pembayaran denda berhasil diproses',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Gagal memproses pembayaran'
      });
    }
  };

  const handleShowDetail = (fine) => {
    setSelectedFine(fine);
    setShowDetailModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Calculate statistics
  const totalFines = fines.reduce((sum, fine) => sum + parseFloat(fine.jumlah_denda || 0), 0);
  const unpaidFines = fines.filter(fine => fine.status === 'Belum Dibayar').length;
  const paidFines = fines.filter(fine => fine.status === 'Sudah Dibayar').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Denda</h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola dan pantau denda pengembalian buku
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={FaMoneyBillWave}
            title="Total Denda"
            value={`Rp ${totalFines.toLocaleString('id-ID')}`}
            className="bg-blue-100 text-blue-600"
          />
          <StatsCard
            icon={FaTimes}
            title="Belum Dibayar"
            value={unpaidFines}
            className="bg-red-100 text-red-600"
          />
          <StatsCard
            icon={FaCheck}
            title="Sudah Dibayar"
            value={paidFines}
            className="bg-green-100 text-green-600"
          />
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama anggota atau judul buku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Sudah Dibayar">Sudah Dibayar</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anggota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Denda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      Tidak ada data denda
                    </td>
                  </tr>
                ) : (
                  currentItems.map((fine, index) => {
                    const member = members.find(m => m.id === fine.id_member);
                    const book = books.find(b => b.id === fine.id_buku);
                    
                    return (
                      <tr key={fine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member?.nama || 'Unknown Member'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book?.judul || 'Unknown Book'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fine.jenis_denda}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rp {parseFloat(fine.jumlah_denda).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            fine.status === 'Sudah Dibayar'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fine.status || 'Belum Dibayar'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleShowDetail(fine)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Lihat Detail"
                            >
                              <FaEye size={18} />
                            </button>
                            {fine.status !== 'Sudah Dibayar' && (
                              <button
                                onClick={() => handlePayFine(fine)}
                                className="text-green-600 hover:text-green-900"
                                title="Proses Pembayaran"
                              >
                                <FaMoneyBillWave size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex justify-center flex-1">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  First
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium
                      ${currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detail Denda"
        >
          {selectedFine && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Anggota</h3>
                      <p className="text-sm text-gray-600">Nama Anggota:</p>
                      <p className="text-base font-medium text-gray-900">
                        {members.find(m => m.id === selectedFine.id_member)?.nama || 'Tidak diketahui'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Buku</h3>
                      <p className="text-sm text-gray-600">Judul Buku:</p>
                      <p className="text-base font-medium text-gray-900">
                        {books.find(b => b.id === selectedFine.id_buku)?.judul || 'Tidak diketahui'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Denda</h3>
                      <p className="text-sm text-gray-600">Jenis Denda:</p>
                      <p className="text-base font-medium text-gray-900">{selectedFine.jenis_denda}</p>
                      <p className="text-sm text-gray-600 mt-2">Jumlah Denda:</p>
                      <p className="text-base font-medium text-gray-900">
                        Rp {parseFloat(selectedFine.jumlah_denda).toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">Status:</p>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedFine.status === 'Sudah Dibayar'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedFine.status || 'Belum Dibayar'}
                      </span>
                    </div>
                    {selectedFine.deskripsi && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi</h3>
                        <p className="text-base text-gray-900">{selectedFine.deskripsi}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default RestorationPage;