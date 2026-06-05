
import { FaInbox, FaPlus } from 'react-icons/fa';

function EmptyState({ title, message, actionText, onAction }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="bg-gray-50 rounded-full p-4 inline-block mb-4">
        <FaInbox className="text-gray-400 text-5xl" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 mx-auto"
        >
          <FaPlus />
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;