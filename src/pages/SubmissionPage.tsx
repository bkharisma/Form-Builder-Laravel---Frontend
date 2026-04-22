import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService, settingsService, formConfigService } from '../services';
import type { DynamicFormData, FormField } from '../types';
import { Button, FormError, ConfirmationScreen, TurnstileVerificationModal } from '../components';
import { DynamicForm } from '../components/public';
import { useDynamicFormValidation } from '../hooks';
import { evaluateConditionalLogic } from '../utils/logicEvaluator';

function SubmissionPage() {
  const params = useParams<{ formSlug: string }>();
  const formSlug = params.formSlug!;
  const [formData, setFormData] = useState<DynamicFormData>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [appName, setAppName] = useState('Form Submission');
  const [appDescription, setAppDescription] = useState('Please fill in your details below');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const enabledFields = useMemo(
    () => formFields.filter(f => f.enabled !== false).sort((a, b) => a.order - b.order),
    [formFields]
  );
  const { validateForm, handleBlur, resetValidation, getFieldError, isFieldTouched } =
    useDynamicFormValidation(enabledFields);

  const resetForm = useCallback(() => {
    const initialFormData: DynamicFormData = {};
    enabledFields.forEach((field) => {
      if (field.type === 'checkbox') {
        initialFormData[field.id] = false;
      } else if (field.type === 'radio') {
        initialFormData[field.id] = field.default_value || '';
      } else {
        initialFormData[field.id] = '';
      }
    });
    setFormData(initialFormData);
    setSubmitted(false);
    setServerError('');
    setTurnstileToken(null);
    resetValidation();
  }, [enabledFields, resetValidation]);

  const submitFormWithToken = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const cleanedData: DynamicFormData = {};
      enabledFields.forEach((field) => {
        if (evaluateConditionalLogic(field.conditional_logic, formData)) {
          cleanedData[field.id] = formData[field.id];
        }
      });

      const dataWithToken = {
        dynamic_data: cleanedData,
        cf_turnstile_response: token,
      };
      const result = await submissionService.submitForm(formSlug, dataWithToken as never);
      setSubmittedAt(new Date(result.submitted_at).toLocaleString());
      setSubmitted(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setServerError(apiError.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setTurnstileToken(null);
    }
  }, [formData]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        if (settings.app_name) setAppName(settings.app_name);
        if (settings.app_description) setAppDescription(settings.app_description);
        if (settings.logo_url) setLogoUrl(settings.logo_url);
      } catch {
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError(null);
        const config = await formConfigService.getPublicFormConfig(formSlug);
        if (config && config.fields && config.fields.length > 0) {
          setFormFields(config.fields);
          if (config.title) setFormTitle(config.title);
          if (config.description) setFormDescription(config.description);
          const initialFormData: DynamicFormData = {};
          config.fields.forEach((field) => {
            if (field.type === 'checkbox') {
              initialFormData[field.id] = false;
            } else if (field.type === 'radio') {
              initialFormData[field.id] = field.default_value || '';
            } else {
              initialFormData[field.id] = '';
            }
          });
          setFormData(initialFormData);
        } else {
          setFormFields([]);
          setFormData({});
        }
      } catch (err) {
        const apiError = err as { message?: string };
        setConfigError(apiError.message || 'Failed to load form configuration. Please try again later.');
      } finally {
        setConfigLoading(false);
      }
    };
    fetchFormConfig();
  }, [formSlug]);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      resetForm();
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitted, resetForm]);

  useEffect(() => {
    if (turnstileToken && isSubmitting && !isModalOpen) {
      submitFormWithToken(turnstileToken);
    }
  }, [turnstileToken, isSubmitting, isModalOpen, submitFormWithToken]);

  const handleChange = (fieldId: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFieldBlur = (fieldId: string, value: string | boolean) => {
    handleBlur(fieldId, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    setIsModalOpen(true);
  };

  const handleVerificationSuccess = (token: string) => {
    setTurnstileToken(token);
    setIsModalOpen(false);
  };

  const handleVerificationError = () => {
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <ConfirmationScreen
        submitterName={String(formData[enabledFields[0]?.id] || 'Respondent')}
        submittedAt={submittedAt}
        onReset={resetForm}
      />
    );
  }

      return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-20 mx-auto mb-4"
              />
            ) : (
              <div className="h-20 mx-auto mb-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {(formTitle || appName).charAt(0)}
                  </span>
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">
              {formTitle || appName}
            </h1>
            {(formDescription || appDescription) && (
              <p className="text-lg text-[#525252]">
                {formDescription || appDescription}
              </p>
            )}
          </div>

        {configLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-[#e5e5e5] rounded w-1/4"></div>
              <div className="h-12 bg-[#e5e5e5] rounded"></div>
              <div className="h-6 bg-[#e5e5e5] rounded w-1/3"></div>
              <div className="h-12 bg-[#e5e5e5] rounded"></div>
              <div className="h-6 bg-[#e5e5e5] rounded w-1/2"></div>
              <div className="h-12 bg-[#e5e5e5] rounded"></div>
            </div>
            <p className="text-center text-[#737373] mt-4">Loading form...</p>
          </div>
        ) : configError ? (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-[#374151] mb-4">{configError}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : enabledFields.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
            <div className="text-center py-8">
              <p className="text-[#737373]">This form is not available. It may not have been published yet, or no fields have been configured.</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6 md:p-10 space-y-6"
            noValidate
          >
            <FormError message={serverError} onDismiss={() => setServerError('')} />

            <DynamicForm
              fields={formFields}
              formData={formData}
              errors={Object.fromEntries(enabledFields.map((f) => [f.id, getFieldError(f.id)]))}
              touched={Object.fromEntries(enabledFields.map((f) => [f.id, isFieldTouched(f.id)]))}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              formSlug={formSlug}
              setFormData={(updater) => setFormData(prev => updater(prev))}
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                fullWidth
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        )}

        <noscript>
          <div className="mt-4 p-4 bg-warning-50 border-2 border-warning-200 rounded-lg text-center">
            <p className="text-warning-800">
              <strong>JavaScript Required:</strong> Please enable JavaScript to complete the submission process.
            </p>
          </div>
        </noscript>

        <TurnstileVerificationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleVerificationSuccess}
          onError={handleVerificationError}
        />
      </div>
    </div>
  );
}

export default SubmissionPage;