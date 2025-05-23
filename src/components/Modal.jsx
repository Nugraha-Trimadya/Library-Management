
import React from 'react';

const Modal = ({ isOpen, onClose, mode, data, onSave, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'detail' && 'Detail Information'}
            {mode === 'edit' && 'Edit Information'}
            {mode === 'delete' && 'Confirm Delete'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'detail' && (
            <div className="space-y-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Name</label>
                <span className="text-gray-900">{data?.name}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <span className="text-gray-900">{data?.description}</span>
              </div>
              {/* Add more fields as needed */}
            </div>
          )}

          {mode === 'edit' && (
            <form className="space-y-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  defaultValue={data?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  defaultValue={data?.description}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* Add more fields as needed */}
            </form>
          )}

          {mode === 'delete' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-900">Are you sure you want to delete this item?</p>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          {mode === 'edit' && (
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          )}
          
          {mode === 'delete' && (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
