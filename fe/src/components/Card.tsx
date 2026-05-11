import React from 'react';
import { Share2, Trash2, FileText, MessageCircle, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface CardProps {
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  link?: string;
  tags: string[];
  date?: string;
}

export const Card = ({ type, title, link, tags, date }: CardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'tweet': return <MessageCircle size={16} />;
      case 'youtube': return <Video size={16} />;
      case 'document': return <FileText size={16} />;
      case 'link': return <LinkIcon size={16} />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'tweet': return 'Tweet';
      case 'youtube': return 'Video';
      case 'document': return 'Document';
      case 'link': return 'Link';
    }
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const renderContent = () => {
    switch (type) {
      case 'tweet':
        return (
          <div className="card-tweet">
            <div className="tweet-avatar">
              <MessageCircle size={20} />
            </div>
            <div className="tweet-body">
              <p className="tweet-text">{title}</p>
            </div>
          </div>
        );

      case 'youtube': {
        const videoId = link ? getYoutubeId(link) : null;
        return (
          <>
            <div className="card-title">{title}</div>
            {videoId ? (
              <div className="card-video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : link ? (
              <a href={link} target="_blank" rel="noreferrer" className="card-video-placeholder">
                <Video size={40} color="#9CA3AF" />
                <span>Watch Video</span>
              </a>
            ) : null}
          </>
        );
      }

      case 'document':
        return (
          <div className="card-document">
            <div className="card-title">{title}</div>
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="card-doc-link">
                <ExternalLink size={14} />
                <span>Open Document</span>
              </a>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="card-link-content">
            <div className="card-title">{title}</div>
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="card-url">
                <LinkIcon size={14} />
                <span className="card-url-text">{link}</span>
              </a>
            )}
          </div>
        );

      default:
        return <div className="card-title">{title}</div>;
    }
  };

  return (
    <div className={`card card--${type}`}>
      <div className="card-header">
        <div className="card-type">
          {getIcon()}
          <span>{getTypeName()}</span>
        </div>
        <div className="card-actions">
          <button title="Share"><Share2 size={16} /></button>
        </div>
      </div>

      {renderContent()}

      <div className="card-tags">
        {tags.map((tag, i) => (
          <span key={i} className="tag">#{tag}</span>
        ))}
      </div>
      {date && <div className="card-date">Added on {date}</div>}
    </div>
  );
};
