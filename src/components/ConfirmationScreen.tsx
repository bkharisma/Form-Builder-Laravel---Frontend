interface ConfirmationScreenProps {
  submitterName: string;
  submittedAt: string;
  onReset: () => void;
  autoResetSeconds?: number;
}

function ConfirmationScreen({
  submitterName,
  submittedAt,
  onReset,
  autoResetSeconds = 5,
}: ConfirmationScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-success-500 rounded-full flex items-center justify-center">
          <svg
            className="h-10 w-10 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">
            Submission Successful!
          </h1>
          <p className="text-lg text-[#525252]">
            Thank you, <span className="font-semibold text-[#1a1a1a]">{submitterName}</span>
          </p>
        </div>

        <div className="bg-[#f5f5f5] rounded-lg p-4 space-y-2">
          <p className="text-sm text-[#737373]">Submitted At</p>
          <p className="text-xl font-semibold text-[#1a1a1a]">{submittedAt}</p>
        </div>

        <p className="text-[#737373] text-base">
          Your submission has been recorded.
        </p>

        <p className="text-sm text-[#a1a1a1]">
          Form will reset in {autoResetSeconds} seconds for the next respondent...
        </p>

        <button
          onClick={onReset}
          className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
        >
          Reset now
        </button>
      </div>
    </div>
  );
}

export default ConfirmationScreen;