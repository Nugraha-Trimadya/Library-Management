import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
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
            <FaEye size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    no_ktp: '',
    nama: '',
    alamat: '',
    tgl_lahir: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://45.64.100.26:88/perpus-api/public/api/member');
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else if (response.data && response.data.data) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch members data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {      const url = selectedMember 
        ? `http://45.64.100.26:88/perpus-api/public/api/member${selectedMember.id}`
        : 'http://45.64.100.26:88/perpus-api/public/api/member';
      
      const method = selectedMember ? 'put' : 'post';
      
      await axios[method](url, formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Member successfully ${selectedMember ? 'updated' : 'created'}!`,
      });
      
      setShowModal(false);
      setFormData({
        no_ktp: '',
        nama: '',
        alamat: '',
        tgl_lahir: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('Error submitting member:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to submit member data',
      });
    }
  };

  const MemberForm = ({ onSubmit, isEdit }) => {
    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. KTP</label>
            <input
              type="text"
              name="no_ktp"
              value={formData.no_ktp}
              onChange={handleLocalChange}
              placeholder="Enter ID number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
              pattern="[0-9]{16}"
              title="KTP number must be 16 digits"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleLocalChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleLocalChange}
              placeholder="Enter address"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              name="tgl_lahir"
              value={formData.tgl_lahir}
              onChange={handleLocalChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            {isEdit ? 'Update' : 'Create'} Member
          </button>
        </div>
      </form>
    );
  };  const handleShowDetails = (member) => {
    setSelectedMember(member);
    setModalType('detail');
    setShowModal(true);
  };

  const handleDelete = (member) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete member "${member.nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMember(member);
      }
    });
  };

  const deleteMember = async (member) => {
    try {
      await axios.delete(`http://45.64.100.26:88/perpus-api/public/api/anggota/${member.id}`);
      Swal.fire('Deleted!', 'Member has been deleted.', 'success');
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      Swal.fire('Error!', 'Failed to delete member.', 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedMember(null);
    setModalType('create');
    setFormData({
      no_ktp: '',
      nama: '',
      alamat: '',
      tgl_lahir: ''
    });
    setShowModal(true);
  };

  // Filter members
  const filteredMembers = members.filter(member => 
    member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.no_ktp.includes(searchTerm)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <FaPlus className="mr-2" />
              Add New Member
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KTP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      No members found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.no_ktp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {member.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.tgl_lahir).toLocaleDateString('id-ID')}
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleShowDetails(member)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="text-rose-600 hover:text-rose-900"
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === 'create' ? 'Add New Member' : modalType === 'edit' ? 'Edit Member' : 'Member Details'}
        >
          {modalType === 'detail' ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-4">{selectedMember?.nama}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">No. KTP</p>
                    <p className="mt-1">{selectedMember?.no_ktp}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                    <p className="mt-1">{new Date(selectedMember?.tgl_lahir).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Alamat</p>
                    <p className="mt-1">{selectedMember?.alamat}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <MemberForm
              onSubmit={handleSubmit}
              initialData={selectedMember}
              isEdit={modalType === 'edit'}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}