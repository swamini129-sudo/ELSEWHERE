import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Tag,
  Palette,
  User,
  ShieldCheck,
  Send,
  CheckCircle,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Item, Claim, UserProfile } from '../types';
import { api } from '../services/api';
import { CategoryPlaceholder } from './CategoryPlaceholder';

interface Props {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onItemUpdated: () => void;
  onRequireAuth: () => void;
}

export const ItemDetailModal: React.FC<Props> = ({
  item,
  isOpen,
  onClose,
  currentUser,
  onItemUpdated,
  onRequireAuth
}) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setClaimantName(currentUser.display_name);
    }
  }, [currentUser]);

  useEffect(() => {
    if (item && isOpen) {
      loadClaims(item.id);
      setClaimSuccess(false);
      setClaimError(null);
      setClaimMessage('');
    }
  }, [item, isOpen]);

  const loadClaims = async (itemId: string) => {
    setLoadingClaims(true);
    try {
      const data = await api.getClaimsForItem(itemId);
      setClaims(data);
    } catch (err) {
      console.error('Error loading claims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  if (!isOpen || !item) return null;

  // Determine if current user is the owner/reporter of this item
  const isReporter = currentUser && (
    (item.reporter_id && item.reporter_id === currentUser.id) ||
    (item.contact_email && item.contact_email === currentUser.email)
  );

  // Check if current user already submitted a claim on this item
  const userClaim = currentUser
    ? claims.find(c => c.claimant_id === currentUser.id)
    : null;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!claimMessage.trim()) {
      setClaimError('Please provide a message explaining your ownership details.');
      return;
    }

    setSubmittingClaim(true);
    setClaimError(null);

    try {
      await api.submitClaim({
        item_id: item.id,
        claimant_id: currentUser.id,
        claimant_name: claimantName || currentUser.display_name,
        claimant_email: currentUser.email,
        claim_message: claimMessage.trim()
      });

      setClaimSuccess(true);
      await loadClaims(item.id);
      onItemUpdated();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setClaimError(err.message);
      } else {
        setClaimError('Failed to submit claim. Please try again.');
      }
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleResolveClaim = async (claimId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.updateClaimStatus(claimId, item.id, status);
      if (status === 'accepted') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      await loadClaims(item.id);
      onItemUpdated();
    } catch (err) {
      console.error('Failed to update claim:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto transition-opacity duration-300">
      <div className="relative w-full max-w-3xl my-8 bg-ivory rounded-lg border border-sage/40 shadow-elevated overflow-hidden animate-modal-pop">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-forest text-ivory flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-widest font-semibold ${
                item.type === 'found' ? 'bg-sage-dark text-ivory' : 'bg-rust text-ivory'
              }`}
            >
              {item.type === 'found' ? 'Found Belonging' : 'Lost Belonging'}
            </span>
            <span className="text-xs font-mono text-sage-light tracking-wide">
              Ref #{item.id.slice(0, 8)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-ivory/70 hover:text-ivory p-1 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {/* Main Visual & Info Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Visual media with non-cropping contain fitting */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-sage/30 bg-[#EAE5DB]/70 flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <CategoryPlaceholder category={item.category} colour={item.colour} />
              )}
            </div>

            {/* Core Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-charcoal-muted flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-sage-dark" />
                  {item.category}
                </span>

                {/* Status pill */}
                {item.status === 'Returned' ? (
                  <span className="px-2.5 py-1 rounded bg-forest text-ivory text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Returned
                  </span>
                ) : item.status === 'Claim Pending' ? (
                  <span className="px-2.5 py-1 rounded bg-rust/15 text-rust border border-rust/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Claim Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-sage/30 text-forest border border-sage/40 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Available
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest leading-tight">
                {item.title}
              </h2>

              <div className="space-y-2 text-xs text-charcoal-muted font-mono border-t border-b border-sage/20 py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
                  <span>Reported Date: <strong>{item.approximate_date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rust flex-shrink-0" />
                  <span>Campus Location: <strong>{item.campus_location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sage-dark flex-shrink-0" />
                  <span>Identified Colour: <strong>{item.colour}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-forest flex-shrink-0" />
                  <span>Reported by: <strong>{item.reporter_name}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                  Description &amp; Context
                </h4>
                <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap font-light">
                  {item.description}
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* OWNER / REPORTER CLAIMS MANAGEMENT INTERFACE            */}
          {/* ======================================================= */}
          {isReporter && (
            <div className="pt-6 border-t border-sage/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    You Reported This Item — Claims Management
                  </h3>
                </div>
                <span className="text-xs font-mono text-charcoal-muted">
                  {claims.length} {claims.length === 1 ? 'claim' : 'claims'} received
                </span>
              </div>

              {loadingClaims ? (
                <p className="text-xs text-charcoal-muted italic">Checking submitted claims...</p>
              ) : claims.length === 0 ? (
                <div className="p-4 bg-ivory-light border border-sage/30 rounded text-center text-xs text-charcoal-muted">
                  No claims have been submitted for this item yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 bg-ivory-light border border-sage/40 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-serif font-bold text-forest text-sm">{claim.claimant_name}</p>
                          <p className="text-[11px] font-mono text-charcoal-muted">{claim.claimant_email || 'Verified Student'}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            claim.claim_status === 'accepted'
                              ? 'bg-forest text-ivory'
                              : claim.claim_status === 'rejected'
                              ? 'bg-rust/20 text-rust'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {claim.claim_status}
                        </span>
                      </div>

                      <div className="bg-ivory p-3 rounded border border-sage/20 text-xs text-charcoal italic">
                        "{claim.claim_message}"
                      </div>

                      {claim.claim_status === 'pending' && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleResolveClaim(claim.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-mono uppercase text-rust hover:bg-rust/10 border border-rust/30 rounded transition-colors"
                          >
                            Reject Claim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveClaim(claim.id, 'accepted')}
                            className="px-3 py-1.5 text-xs font-mono uppercase bg-forest text-ivory hover:bg-forest-surface rounded transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept &amp; Mark Returned
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* CLAIM SUBMISSION WORKFLOW FOR STUDENTS                  */}
          {/* ======================================================= */}
          {!isReporter && item.status !== 'Returned' && (
            <div className="pt-6 border-t border-sage/30 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <h3 className="font-serif text-lg font-bold text-forest">
                  {item.type === 'found' ? 'Claim This Belonging' : 'I Found This Item'}
                </h3>
              </div>

              {userClaim ? (
                <div className="p-4 bg-sage/20 border border-sage rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-forest font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Your claim has been recorded!</span>
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Status: <strong className="uppercase font-mono">{userClaim.claim_status}</strong>. The reporter has been notified to verify your ownership proof.
                  </p>
                  <p className="text-xs italic text-charcoal bg-ivory p-2 rounded border border-sage/30">
                    "{userClaim.claim_message}"
                  </p>
                </div>
              ) : claimSuccess ? (
                <div className="p-4 bg-sage/30 border border-sage rounded-lg text-center space-y-2 animate-fadeIn">
                  <CheckCircle className="w-8 h-8 text-forest mx-auto" />
                  <p className="font-serif font-bold text-forest text-base">Claim Transmitted Successfully</p>
                  <p className="text-xs text-charcoal-muted">
                    The reporter has received your ownership verification note. The item status is now pending review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4 bg-ivory-light p-5 rounded-lg border border-sage/30">
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    To prevent fraudulent pickups, please describe a <strong>distinctive detail</strong> not mentioned in the public listing (such as lock code, unique scratch, stickers, or specific contents).
                  </p>

                  {claimError && (
                    <div className="p-3 bg-rust/10 border border-rust/40 text-rust text-xs rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{claimError}</span>
                    </div>
                  )}

                  {!currentUser && (
                    <div className="p-3 bg-forest/5 border border-forest/20 rounded flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted">You must sign in with your campus identity to submit a claim.</span>
                      <button
                        type="button"
                        onClick={onRequireAuth}
                        className="px-3 py-1 bg-forest text-ivory rounded font-mono uppercase text-[11px] font-semibold hover:bg-forest-surface"
                      >
                        Sign In First
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                      Proof of Ownership / Distinguishing Verification
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      placeholder="e.g. The water bottle has a small dent on the bottom and a Yosemite national park sticker on the backside..."
                      className="w-full p-3 text-sm bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal font-light"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingClaim}
                      className="px-5 py-2.5 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest-surface transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingClaim ? 'Transmitting Claim...' : 'Submit Claim'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {item.status === 'Returned' && (
            <div className="p-4 bg-forest/10 border border-forest/20 rounded-lg text-center space-y-1">
              <Check className="w-6 h-6 text-forest mx-auto" />
              <p className="font-serif font-bold text-forest text-base">This Belonging Has Been Reconnected</p>
              <p className="text-xs text-charcoal-muted">
                The owner and finder have successfully coordinated the return.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
