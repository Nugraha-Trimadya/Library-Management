import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaSearch, FaPlus, FaInfoCircle, FaUndo, FaCheckCircle, FaFileExcel } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// Modal Component from previous implementation
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm bg-gray-700/30 transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 p-6 relative z-50 transform transition-all shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaInfoCircle size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// LendingForm Component
const LendingForm = ({ onSubmit, initialData, onClose, books, members }) => {
  const [formData, setFormData] = useState(initialData || {
    id_buku: '',
    id_member: '',
    tgl_pinjam: '',
    tgl_pengembalian: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Calculate min and max dates for date inputs
  const today = new Date().toISOString().split('T')[0];
  const maxReturnDate = new Date();
  maxReturnDate.setDate(maxReturnDate.getDate() + 14); // 14 days from today
  const maxReturnDateString = maxReturnDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleLocalSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Book ID</label>
        <select
          name="id_buku"
          value={formData.id_buku}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        >
          <option value="">Select a book</option>
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.judul}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Member ID</label>
        <select
          name="id_member"
          value={formData.id_member}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        >
          <option value="">Select a member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.nama} - {member.no_ktp}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Borrow Date</label>
        <input
          type="date"
          name="tgl_pinjam"
          value={formData.tgl_pinjam}
          onChange={handleChange}
          min={today}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Return Date</label>
        <input
          type="date"
          name="tgl_pengembalian"
          value={formData.tgl_pengembalian}
          onChange={handleChange}
          min={formData.tgl_pinjam || today}
          max={maxReturnDateString}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">Maximum lending period is 14 days</p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

// Borrowing Rules Card Component
const BorrowingRules = () => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <FaInfoCircle className="mr-2 text-rose-600" />
      Borrowing Rules
    </h2>
    <div className="space-y-3 text-sm text-gray-600">
      <p>• Maximum borrowing period is 14 days</p>
      <p>• Each member can borrow up to 3 books at a time</p>
      <p>• Late returns will be subject to fines of Rp. 1000/day</p>
      <p>• Damaged or lost books must be replaced or compensated</p>
      <p>• Members must present their ID when borrowing books</p>
    </div>
  </div>
);

// Fungsi untuk mengekspor data ke Excel


export default function Lendings() {
  const [lendings, setLendings] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLending, setDetailLending] = useState(null);
  const [formModal, setFormModal] = useState({
    id_buku: "",
    id_member: "",
    tgl_pinjam: "",
    tgl_pengembalian: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [lateFeesData, setLateFeesData] = useState([]); // State untuk data denda

  const handleExportToExcel = () => {
  try {    // Persiapkan data untuk ekspor

    const exportData = lendings.map(lending => {
      const book = books.find(b => b.id === lending.id_buku) || {};
      const member = members.find(m => m.id === lending.id_member) || {};
      
      // Menentukan status peminjaman
      let status = 'Aktif';
      if (lending.status_pengembalian === 1) {
        status = 'Dikembalikan';
      } else {
        const returnDate = new Date(lending.tgl_pengembalian);
        const today = new Date();
        if (today > returnDate) {
          status = 'Terlambat';
        }
      }

      return {
        'ID Peminjaman': lending.id,
        'Nama Member': member.nama || 'Unknown',
        'No KTP': member.no_ktp || 'Unknown',
        'Judul Buku': book.judul || 'Unknown',
        'No Rak': book.no_rak || 'Unknown',
        'Tanggal Pinjam': lending.tgl_pinjam ? new Date(lending.tgl_pinjam).toLocaleDateString('id-ID') : '-',
        'Tanggal Harus Kembali': lending.tgl_pengembalian ? new Date(lending.tgl_pengembalian).toLocaleDateString('id-ID') : '-',
        'Tanggal Dikembalikan': lending.tgl_dikembalikan ? new Date(lending.tgl_dikembalikan).toLocaleDateString('id-ID') : '-',
        'Status': status
      };
    });

    // Buat workbook baru
    const workbook = XLSX.utils.book_new();
    // Buat worksheet dari data
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Atur lebar kolom
    const columnWidths = [
      { wch: 15 }, // ID Peminjaman
      { wch: 25 }, // Nama Member
      { wch: 20 }, // No KTP
      { wch: 35 }, // Judul Buku
      { wch: 10 }, // No Rak
      { wch: 15 }, // Tanggal Pinjam
      { wch: 15 }, // Tanggal Harus Kembali
      { wch: 15 }, // Tanggal Dikembalikan
      { wch: 25 }  // Status
    ];
    worksheet['!cols'] = columnWidths;
    
    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peminjaman');
    
    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Data_Peminjaman_${timestamp}.xlsx`;

    // Write workbook dan konversi ke blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    // Download file menggunakan file-saver
    saveAs(blob, fileName);

    // Tampilkan notifikasi sukses
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil diekspor ke Excel',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire({
      icon: 'error',
      title: 'Export Gagal',
      text: 'Terjadi kesalahan saat mengekspor data ke Excel',
      showConfirmButton: true
    });
  }
};
  
  const navigate = useNavigate();
  const getToken = localStorage.getItem('token');

  // Menggabungkan fetchData dengan fetchPeminjaman, fetchBooks, dan fetchMembers
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch peminjaman data
      const resLendings = await axios.get(`${API_URL}peminjaman`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: 'application/json'
        }
      });
      
      setLendings(resLendings.data.data || []);
      setFilteredData(resLendings.data.data || []);
      
      // Fetch books data
      const resBooks = await axios.get(`${API_URL}buku`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: 'application/json'
        }
      });
      
      setBooks(resBooks.data || []);
      
      // Fetch members data
      const resMembers = await axios.get(`${API_URL}member`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: 'application/json'
        }
      });
      
      setMembers(resMembers.data || []);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      
      console.error('Error fetching data:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal memuat data."
      );
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi pencarian yang ditingkatkan
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(lendings);
      return;
    }

    const searchString = searchTerm.toLowerCase().trim();    const filtered = lendings.filter(lending => {
      // Convert status_pengembalian to number if it's a boolean
      lending.status_pengembalikan = Number(lending.status_pengembalikan);
      
      const book = books.find(b => b.id === lending.id_buku);
      const member = members.find(m => m.id === lending.id_member);

      // Mencari berdasarkan ID Buku
      const bookIdMatch = String(lending.id_buku).toLowerCase().includes(searchString);

      // Mencari berdasarkan Judul Buku
      const titleMatch = book && book.judul.toLowerCase().includes(searchString);

      // Mencari berdasarkan ID Member
      const memberIdMatch = String(lending.id_member).toLowerCase().includes(searchString);

      // Mencari berdasarkan Nama Member
      const nameMatch = member && member.nama.toLowerCase().includes(searchString);

      // Mencari berdasarkan Tanggal
      const dateMatch =
        lending.tgl_pinjam.toLowerCase().includes(searchString) ||
        lending.tgl_pengembalian.toLowerCase().includes(searchString);

      return bookIdMatch || titleMatch || memberIdMatch || nameMatch || dateMatch;
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat pencarian berubah
  }, [searchTerm, lendings, books, members]);

  // Fungsi untuk mengurutkan data
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredData(sortedData);
  };

  // Fungsi untuk menangani penambahan peminjaman
  const handlePeminjaman = async (e) => {
    e.preventDefault();
    
    // Validasi field yang diperlukan
    if (!formModal.id_buku || !formModal.id_member || !formModal.tgl_pinjam || !formModal.tgl_pengembalian) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Semua field harus diisi',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    
    // Menampilkan Sweet Alert konfirmasi
    Swal.fire({
      title: 'Konfirmasi Peminjaman',
      text: 'Apakah Anda yakin ingin menambahkan data peminjaman ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Tambahkan!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proses penambahan peminjaman
        axios.post(`${API_URL}peminjaman`, formModal, {
          headers: {
            Authorization: `Bearer ${getToken}`,
            Accept: 'application/json'
          }
        })
          .then(() => {
            Swal.fire({
              title: 'Berhasil!',
              text: 'Data peminjaman berhasil ditambahkan',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            setFormModal({ id_buku: "", id_member: "", tgl_pinjam: "", tgl_pengembalian: "" });
            setShowModal(false);
            fetchData();
          })
          .catch(err => {
            if (err.response && err.response.status === 401) {
              localStorage.removeItem("token");
              navigate("/login");
            }
            Swal.fire({
              title: 'Error!',
              text: err.response?.data?.message || err.response?.data?.error || 'Gagal menambahkan data peminjaman',
              icon: 'error'
            });
          });
      }
    });
  };

  // Fungsi untuk menangani pengembalian buku
  const handleReturn = async (lending) => {
    try {
      // Cek keterlambatan
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const returnDate = new Date(lending.tgl_pengembalian);
      returnDate.setHours(0, 0, 0, 0);
      const isOverdue = today > returnDate;
      const daysLate = isOverdue ? Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24)) : 0;
      const fineAmount = daysLate * 1000; // Rp 1.000 per hari

      // Form untuk pengembalian dan pengecekan kondisi buku
      const { value: returnDetails } = await Swal.fire({
        title: 'Pengecekan Pengembalian Buku',
        html: `
          <div class="text-left">
            ${isOverdue ? `
              <div class="mb-4 p-3 bg-red-50 rounded-md">
                <p class="font-medium text-red-800">Keterlambatan Terdeteksi</p>
                <p class="text-sm text-red-600">• ${daysLate} hari terlambat</p>
                <p class="text-sm text-red-600">• Denda: Rp. ${fineAmount.toLocaleString('id-ID')}</p>
              </div>
            ` : ''}
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Kondisi Buku</label>
              <select id="condition" class="w-full px-3 py-2 border rounded-md">
                <option value="">Pilih Kondisi Buku</option>
                <option value="baik">Baik (Tidak Ada Kerusakan)</option>
                <option value="rusak">Rusak (Perlu Denda)</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div id="damageForm" class="hidden">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Denda</label>
                <select id="jenis_denda" class="w-full px-3 py-2 border rounded-md">
                  <option value="kerusakan">Kerusakan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea id="deskripsi" class="w-full px-3 py-2 border rounded-md" rows="3" 
                  placeholder="Deskripsikan kerusakan atau alasan denda..."></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Denda (Rp)</label>
                <input type="number" id="jumlah_denda" class="w-full px-3 py-2 border rounded-md" 
                  placeholder="Masukkan nominal denda" />
              </div>
            </div>
          </div>
        `,
        didOpen: () => {
          // Show/hide damage form based on condition selection
          const conditionSelect = document.getElementById('condition');
          const damageForm = document.getElementById('damageForm');
          
          conditionSelect.addEventListener('change', (e) => {
            damageForm.style.display = e.target.value === 'baik' ? 'none' : 'block';
          });
        },
        preConfirm: () => {
          const condition = document.getElementById('condition').value;
          if (!condition) {
            Swal.showValidationMessage('Pilih kondisi buku');
            return false;
          }

          if (condition !== 'baik') {
            const jenisDenda = document.getElementById('jenis_denda').value;
            const deskripsi = document.getElementById('deskripsi').value;
            const jumlahDenda = document.getElementById('jumlah_denda').value;

            if (!deskripsi || !jumlahDenda) {
              Swal.showValidationMessage('Lengkapi detail denda');
              return false;
            }

            return {
              condition,
              jenisDenda,
              deskripsi,
              jumlahDenda: parseInt(jumlahDenda)
            };
          }

          return { condition };
        },
        showCancelButton: true,
        confirmButtonText: 'Proses Pengembalian',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444'
      });

      if (!returnDetails) return; // User canceled

      // Proses pengembalian buku
      await axios.put(`${API_URL}peminjaman/pengembalian/${lending.id}`, {
        tgl_dikembalikan: today.toISOString().split('T')[0],
        status_pengembalian: 1
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json'
        }
      });

      const dendasToCreate = [];

      // Tambah denda keterlambatan jika ada
      if (isOverdue) {
        dendasToCreate.push({
          id_member: lending.id_member,
          id_buku: lending.id_buku,
          jumlah_denda: fineAmount,
          jenis_denda: 'terlambat',
          deskripsi: `Keterlambatan pengembalian ${daysLate} hari`,
        });
      }

      // Tambah denda kerusakan/lainnya jika ada
      if (returnDetails.condition !== 'baik') {
        dendasToCreate.push({
          id_member: lending.id_member,
          id_buku: lending.id_buku,
          jumlah_denda: returnDetails.jumlahDenda,
          jenis_denda: returnDetails.jenisDenda,
          deskripsi: returnDetails.deskripsi,
        });
      }

      // Buat semua denda yang diperlukan
      for (const denda of dendasToCreate) {
        await axios.post(`${API_URL}denda`, denda, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json'
          }
        });
      }

      // Tampilkan ringkasan denda
      if (dendasToCreate.length > 0) {
        const totalDenda = dendasToCreate.reduce((sum, denda) => sum + denda.jumlah_denda, 0);
        await Swal.fire({
          icon: 'warning',
          title: 'Buku Dikembalikan dengan Denda',
          html: `
            <div class="text-left">
              <p class="mb-3">Rincian denda yang harus dibayar:</p>
              <ul class="list-disc pl-5 mb-4">
                ${dendasToCreate.map(denda => `
                  <li class="mb-2">
                    <span class="font-medium">${denda.jenis_denda === 'terlambat' ? 'Denda Keterlambatan' : 
                    denda.jenis_denda === 'kerusakan' ? 'Denda Kerusakan' : 'Denda Lainnya'}</span><br>
                    <span class="text-sm">Rp. ${denda.jumlah_denda.toLocaleString('id-ID')}</span>
                  </li>
                `).join('')}
              </ul>
              <p class="text-lg font-semibold text-red-600">Total Denda: Rp. ${totalDenda.toLocaleString('id-ID')}</p>
              <p class="mt-3 text-sm text-gray-600">Silahkan selesaikan pembayaran di menu Denda.</p>
            </div>
          `,
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Mengerti'
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Buku berhasil dikembalikan tanpa denda',
          timer: 1500,
          showConfirmButton: false
        });
      }

      // Refresh data
      await fetchData();

    } catch (error) {
      console.error('Error returning book:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengembalikan buku',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Pagination yang ditingkatkan
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Tambahkan fungsi openCreateModal
  const openCreateModal = () => {
    setFormModal({
      id_buku: '',
      id_member: '',
      tgl_pinjam: '',
      tgl_pengembalian: ''
    });
    setShowModal(true);
  };
  const handleSubmitModal = async (formData) => {    
    try {
      // Validasi field yang diperlukan
      if (!formData.id_buku || !formData.id_member || !formData.tgl_pinjam || !formData.tgl_pengembalian) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Semua field harus diisi',
          confirmButtonColor: '#3B82F6'
        });
        return;
      }

      // Menampilkan Sweet Alert konfirmasi
      const confirmResult = await Swal.fire({
        title: 'Konfirmasi Peminjaman',
        text: 'Apakah Anda yakin ingin menambahkan data peminjaman ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Ya, Tambahkan!',
        cancelButtonText: 'Batal'
      });

      if (!confirmResult.isConfirmed) return;

      // Proses penambahan peminjaman
      await axios.post(`${API_URL}peminjaman`, formData, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: 'application/json'
        }
      });

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Data peminjaman berhasil ditambahkan',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setFormModal({ id_buku: "", id_member: "", tgl_pinjam: "", tgl_pengembalian: "" });
      setShowModal(false);
      fetchData();

    } catch (err) {
      console.error('Error adding lending:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || err.response?.data?.error || 'Gagal menambahkan data peminjaman',
        icon: 'error'
      });
    }
  };

  // Komponen DetailView yang sudah ada
  const handleDetail = (lending) => {
    // Mencari data member dan buku yang terkait
    const member = members.find(m => m.id === lending.id_member);
    const book = books.find(b => b.id === lending.id_buku);
    
    // Menyiapkan data detail untuk ditampilkan di modal
    const detailData = {
      ...lending,
      member,
      book
    };
    
    // Set data detail dan buka modal
    setDetailLending(detailData);
    setDetailModalOpen(true);
  };

  // Komponen DetailView yang sudah ada
  const DetailView = ({ lending }) => {
    if (!lending) return null;
    
    const isOverdue = new Date(lending.tgl_pengembalian) < new Date();
    const daysLeft = Math.ceil((new Date(lending.tgl_pengembalian) - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Anggota</h3>
                <p className="text-sm text-gray-600">Nama Anggota:</p>
                <p className="text-base font-medium text-gray-900">{lending.member?.nama || 'Tidak diketahui'}</p>
                <p className="text-sm text-gray-600 mt-2">Nomor KTP:</p>
                <p className="text-base font-medium text-gray-900">{lending.member?.no_ktp || 'Tidak diketahui'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Buku</h3>
                <p className="text-sm text-gray-600">Judul Buku:</p>
                <p className="text-base font-medium text-gray-900">{lending.book?.judul || 'Tidak diketahui'}</p>
                <p className="text-sm text-gray-600 mt-2">Nomor Rak:</p>
                <p className="text-base font-medium text-gray-900">{lending.book?.no_rak || 'Tidak diketahui'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Peminjaman</h3>
                <p className="text-sm text-gray-600">Tanggal Pinjam:</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(lending.tgl_pinjam).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-2">Tanggal Pengembalian:</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(lending.tgl_pengembalian).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Peminjaman</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isOverdue ? 'Terlambat' : 'Aktif'}
                </div>
                {!isOverdue && (
                  <p className="text-sm text-gray-600 mt-2">
                    Sisa waktu: {daysLeft} hari
                  </p>
                )}
                {isOverdue && (
                  <p className="text-sm text-red-600 mt-2">
                    Terlambat: {Math.abs(daysLeft)} hari
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Lending Management</h1>
            <div className="flex space-x-3">              <button
                onClick={handleExportToExcel}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaFileExcel className="mr-2" />
                Export Excel
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <FaPlus className="mr-2" />
                Add New Lending
              </button>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`p-4 mb-4 rounded-md ${
            alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {alert.message}
          </div>
        )}

        {/* Borrowing Rules Card */}
        <BorrowingRules />

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by member name, ID, or book title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Lendings Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      No lending records found
                    </td>
                  </tr>
                ) : (                  currentItems.map((lending, index) => {
                    const member = members.find(m => m.id === lending.id_member);
                    const book = books.find(b => b.id === lending.id_buku);
                    // Convert status_pengembalian to number
                    lending.status_pengembalikan = Number(lending.status_pengembalikan);
                    const isOverdue = new Date(lending.tgl_pengembalian) < new Date();
                    
                    return (
                      <tr key={lending.id} className="hover:bg-gray-50">
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
                          {new Date(lending.tgl_pinjam).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lending.tgl_pengembalian).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isOverdue ? 'Terlambat' : 'Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex items-center space-x-3">
    <button
      onClick={() => handleDetail(lending)}
      className="text-blue-600 hover:text-blue-900 flex items-center"
      title="Lihat Detail"
    >
      <FaEye size={18} className="mr-1" />
      Detail
    </button>

    {lending.status_pengembalian ? (
      <span className="text-gray-500 flex items-center" title="Sudah Dikembalikan">
        <FaCheckCircle size={18} className="mr-1" />
        Dikembalikan
      </span>
    ) : (
      <button
        onClick={() => handleReturn(lending)}
        className="text-green-600 hover:text-green-900 flex items-center"
        title="Kembalikan Buku"
      >
        <FaUndo size={18} className="mr-1" />
        Kembalikan
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
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  First
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium
                      ${currentPage === i + 1
                        ? 'z-10 bg-rose-50 border-rose-500 text-rose-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        )}        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Lending"
        >
          <LendingForm
            onSubmit={handleSubmitModal}
            initialData={formModal}
            onClose={() => setShowModal(false)}
            books={books}
            members={members}
          />
        </Modal>
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Detail Peminjaman"
        >
          <DetailView lending={detailLending} />
        </Modal>
      </div>
    </div>
  );
}
