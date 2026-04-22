import { useParams, Link } from 'react-router-dom';
import { Button } from '../components';

function FormDashboardPage() {
  const { formId } = useParams();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Form Dashboard</h1>
          <p className="text-sm sm:text-base text-[#525252]">Managing Form ID: {formId}</p>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link to="/dashboard">
             <Button variant="secondary" className="text-sm sm:text-base">Back to Forms</Button>
          </Link>
          <Link to={`/form/${formId}`}>
             <Button variant="primary" className="text-sm sm:text-base">Edit Form</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
           <h3 className="text-xs sm:text-sm text-[#737373] font-medium mb-1 sm:mb-2">Total Submissions</h3>
           <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">0</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
           <h3 className="text-xs sm:text-sm text-[#737373] font-medium mb-1 sm:mb-2">Completion Rate</h3>
           <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">0%</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
           <h3 className="text-xs sm:text-sm text-[#737373] font-medium mb-1 sm:mb-2">Status</h3>
           <p className="text-2xl sm:text-3xl font-bold text-blue-600">Draft</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)] p-4 sm:p-6 flex flex-col items-center justify-center h-48 sm:h-64">
        <p className="text-sm sm:text-base text-[#737373] mb-2 sm:mb-4">Detailed charts and tables will be available here.</p>
      </div>
    </div>
  );
}

export default FormDashboardPage;
