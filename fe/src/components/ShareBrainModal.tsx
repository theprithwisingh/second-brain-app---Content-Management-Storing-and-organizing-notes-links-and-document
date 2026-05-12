import React, { useState } from 'react';
import { X, Copy, Share2, ExternalLink } from 'lucide-react';

interface ShareBrainModalProps {
  onClose: () => void;
  shareLink?: string;
  onShare: () => void;
  onDisableShare: () => void;
  itemCount: number;
}

export const ShareBrainModal = ({ onClose, shareLink, onShare, onDisableShare, itemCount }: ShareBrainModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Share Your Second Brain</div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          Share your entire collection of notes, documents, tweets, and videos with others. They'll be able to view your content via a shareable link.
        </div>
        <div className="modal-footer">
          {shareLink ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                <a 
                  href={shareLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ flex: 1, textDecoration: 'none', color: 'var(--primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={16} />
                  {shareLink}
                </a>
                <button className="btn btn-primary" onClick={handleCopy} style={{ padding: '8px 12px' }}>
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={onDisableShare} 
                style={{ width: '100%', color: '#DC2626', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}
              >
                Disable Share Link
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onShare} style={{ width: '100%', justifyContent: 'center' }}>
              <Share2 size={18} />
              Share Brain
            </button>
          )}
          <div className="modal-footer-text" style={{ marginTop: '12px' }}>{itemCount} items will be shared</div>
        </div>
      </div>
    </div>
  );
};
