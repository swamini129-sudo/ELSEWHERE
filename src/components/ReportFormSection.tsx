import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Palette,
  Tag,
  Mail,
  User,
} from 'lucide-react';
import { Item, ItemCategory, ItemType, UserProfile } from '../types';
import { api } from '../services/api';

interface Props {
  currentUser: UserProfile | null;
  onItemCreated: (newItem: Item) => void;
  onNavigateListings: () => void;
  onRequireAuth: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Keys',
  'Bottles',
  'Stationery',
  'Electronics',
  'ID Cards',
  'Other',
];

export const ReportFormSection: React.FC<Props> = ({
  currentUser,
  onItemCreated,
  onNavigateListings,
  onRequireAuth,
}) => {
  const [reportType, setReportType] = useState<ItemType>('found');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Keys');
  const [campusLocation, setCampusLocation] = useState('');
  const [approxDate, setApproxDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [colour, setColour] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(
    currentUser?.display_name || ''
  );
  const [contactEmail, setContactEmail] = useState(
    currentUser?.email || ''
  );

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Form submission states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<Item | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Synchronize current user when changed
  React.useEffect(() => {
    if (currentUser) {
      if (!reporterName) {
        setReporterName(currentUser.display_name);
      }
      if (!contactEmail) {
        setContactEmail(currentUser.email);
      }
    }
  }, [currentUser]);

  // Handle photo selection and validation
  const handlePhotoSelect = (file: File) => {
    setPhotoError(null);

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      setPhotoError(
        'Invalid image format. Only JPEG, PNG, and WebP files are accepted.'
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setPhotoError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum size is 5 MB.`
      );
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !title.trim() ||
      !campusLocation.trim() ||
      !colour.trim() ||
      !description.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const createdItem = await api.createItem(
        {
          reporter_id: currentUser?.id || null,
          reporter_name:
            reporterName.trim() ||
            currentUser?.display_name ||
            'Campus Student',
          title: title.trim(),
          category,
          colour: colour.trim(),
          description: description.trim(),
          campus_location: campusLocation.trim(),
          type: reportType,
          approximate_date: approxDate,
          contact_email: contactEmail.trim() || null,
        },
        photoFile
      );

      setSuccessReport(createdItem);
      onItemCreated(createdItem);

      // Reset form fields
      setTitle('');
      setCampusLocation('');
      setColour('');
      setDescription('');
      handleRemovePhoto();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError(
          'Failed to record report. Please check your network and try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="report"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-sage/30"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-forest font-semibold block mb-1">
          CAMPUS OFFICIAL REGISTRATION
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
          Report an Item
        </h2>

        <p className="text-sm text-charcoal-muted mt-2 font-light">
          Whether you misplaced an essential belonging or discovered an
          orphaned item, submit a detailed archival record to initiate reunion.
        </p>
      </div>

      {successReport ? (
        <div className="bg-ivory-light border border-sage/40 rounded-xl p-8 text-center space-y-4 shadow-cinematic animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-forest text-ivory flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-forest">
            Report Registered Successfully
          </h3>

          <p className="text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Your {successReport.type === 'found' ? 'found' : 'lost'} report
            for{' '}
            <strong className="text-forest font-serif">
              "{successReport.title}"
            </strong>{' '}
            has been logged to the central campus database and is now live in
            the directory.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => setSuccessReport(null)}
              className="px-5 py-2.5 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest-surface transition-colors"
            >
              Submit Another Report
            </button>

            <button
              type="button"
              onClick={onNavigateListings}
              className="px-5 py-2.5 border border-forest/30 text-forest rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest/5 transition-colors inline-flex items-center justify-center"
            >
              View in Listings &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-ivory-light border border-sage/40 rounded-xl p-6 sm:p-8 shadow-cinematic space-y-6"
        >
          {formError && (
            <div className="p-4 bg-rust/10 border border-rust/30 rounded-lg text-rust text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Report Type */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-charcoal-muted mb-2 font-semibold">
              Select Report Type *
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-3.5 px-4 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all border text-center ${
                  reportType === 'found'
                    ? 'bg-forest text-ivory border-forest shadow-md'
                    : 'bg-ivory border-sage/40 text-charcoal-muted hover:border-forest/50'
                }`}
              >
                I Found Something
              </button>

              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-3.5 px-4 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all border text-center ${
                  reportType === 'lost'
                    ? 'bg-rust text-ivory border-rust shadow-md'
                    : 'bg-ivory border-sage/40 text-charcoal-muted hover:border-rust/50'
                }`}
              >
                I Lost Something
              </button>
            </div>
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
              Item Title *
            </label>

            <div className="relative">
              <FileText className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sage Green Hydroflask (32oz) with stickers"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal"
              />
            </div>
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
                Category *
              </label>

              <div className="relative">
                <Tag className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ItemCategory)
                  }
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal font-mono"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
                Approximate Date *
              </label>

              <div className="relative">
                <Calendar className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <input
                  type="date"
                  required
                  value={approxDate}
                  onChange={(e) => setApproxDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal font-mono"
                />
              </div>
            </div>
          </div>

          {/* Campus Location and Colour */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
                Campus Location *
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <input
                  type="text"
                  required
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  placeholder="e.g. Science Complex, Lab 2B"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
                Primary Colour *
              </label>

              <div className="relative">
                <Palette className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <input
                  type="text"
                  required
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. Brass, Forest Green, Matte Black"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-charcoal mb-1 font-semibold">
              Detailed Description *
            </label>

            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide identifiable markings, brand, case, or specific context where it was spotted or misplaced..."
              className="w-full p-3 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal leading-relaxed font-light"
            />
          </div>

          {/* Photo Upload */}
          <div className="pt-2 border-t border-sage/20">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-charcoal font-semibold block">
                Photograph (Optional but Recommended)
              </label>

              <span className="text-[11px] font-mono text-charcoal-muted">
                JPEG, PNG, WebP • Max 5 MB
              </span>
            </div>

            {photoError && (
              <div className="p-3 mb-3 bg-rust/10 border border-rust/30 text-rust text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {photoPreview ? (
              <div className="relative w-full sm:w-72 aspect-[4/3] rounded-lg overflow-hidden border-2 border-forest/40 bg-ivory-dark group">
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-ivory text-forest rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-ivory-light flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 bg-rust text-ivory rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-rust-hover flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sage hover:border-forest/50 bg-ivory/50 rounded-lg p-6 text-center cursor-pointer transition-colors"
              >
                <div className="flex justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest">
                    <Upload className="w-5 h-5" />
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    title="Take photo directly with mobile camera"
                    className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest hover:text-ivory flex items-center justify-center text-forest transition-colors sm:hidden"
                  >
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-sm font-medium text-forest">
                  Click to browse or drag and drop a photo
                </p>

                <p className="text-xs text-charcoal-muted mt-1">
                  Upload an authentic photo of the item. No AI generation allowed.
                </p>
              </div>
            )}

            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Mobile camera capture */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Reporter and Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-sage/20">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal-muted mb-1 font-semibold">
                Reporter Display Name
              </label>

              <div className="relative">
                <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-charcoal-muted mb-1 font-semibold">
                Contact Email
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />

                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] font-mono text-charcoal-muted">
              {currentUser
                ? 'Publishing under your authenticated account'
                : 'Anonymous guest reporting enabled'}
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-widest font-semibold hover:bg-forest-surface hover:shadow-cinematic transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-sage-light" />

              <span>
                {submitting
                  ? 'Archiving Report...'
                  : `Publish ${reportType === 'found' ? 'Found' : 'Lost'} Report`}
              </span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};