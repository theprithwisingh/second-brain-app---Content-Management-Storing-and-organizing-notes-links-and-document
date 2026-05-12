
import { Share2, FileText, MessageCircle, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface CardProps {
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  link?: string;
  tags: string[];
  date?: string;
}

export const Card = ({ type, title, link, tags, date }: CardProps) => {

  // Get YouTube video ID from URL
  let videoId = null;
  if (type === 'youtube' && link) {
    const match = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) videoId = match[1];
  }

  return (
    <div className={`card card--${type}`}>

      {/* Header: icon + type label + action buttons */}
      <div className="card-header">
        <div className="card-type">
          {type === 'tweet' && <MessageCircle size={16} />}
          {type === 'youtube' && <Video size={16} />}
          {type === 'document' && <FileText size={16} />}
          {type === 'link' && <LinkIcon size={16} />}
          <span>{type === 'youtube' ? 'Video' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
        <div className="card-actions">
          <button title="Share"><Share2 size={16} /></button>
          {/* <button title="Delete" onClick={onDelete}><Trash2 size={16} /></button> */}
        </div>
      </div>

      {/* Content: changes based on type */}
      {type === 'tweet' && (
        <div className="card-tweet">
          <div className="tweet-avatar"><MessageCircle size={20} /></div>
          <div className="tweet-body"><p className="tweet-text">{title}</p></div>
        </div>
      )}

      {type === 'youtube' && (
        <>
          <div className="card-title">{title}</div>
          {videoId && (
            <div className="card-video-embed">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </>
      )}

      {type === 'document' && (
        <div className="card-document">
          <div className="card-title">{title}</div>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="card-doc-link">
              <ExternalLink size={14} />
              <span>Open Document</span>
            </a>
          )}
        </div>
      )}

      {type === 'link' && (
        <div className="card-link-content">
          <div className="card-title">{title}</div>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="card-url">
              <LinkIcon size={14} />
              <span className="card-url-text">{link}</span>
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="card-tags">
        {tags.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
      </div>
      {date && <div className="card-date">Added on {date}</div>}
    </div>
  );
};

