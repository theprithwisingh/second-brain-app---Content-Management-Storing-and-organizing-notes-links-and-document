import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/Card';
import { BrainCircuit } from 'lucide-react';

const API_BASE = "http://localhost:3001/api/v1";

interface ContentType {
  id: string;
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  link?: string;
  tags: string[];
}

interface SharedData {
  username: string;
  content: ContentType[];
}

const ShareContent = () => {
  const { shareLink } = useParams<{ shareLink: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareLink) return;

    axios.get(`${API_BASE}/brain/${shareLink}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch shared brain:', err);
        setError(err.response?.data?.message || 'Failed to load shared brain');
        setLoading(false);
      });
  }, [shareLink]);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <h2 className="empty-title">Oops!</h2>
          <p className="empty-subtitle">{error || "This brain couldn't be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'block', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Read-only Header */}
      <header style={{ 
        backgroundColor: 'var(--surface)', 
        borderBottom: '1px solid var(--border)', 
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <BrainCircuit color="var(--primary)" size={32} />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {data.username}'s Second Brain
        </h1>
      </header>
      
      {/* Main Content Area */}
      <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
        {data.content.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2 className="empty-title">Nothing here yet</h2>
              <p className="empty-subtitle">This user hasn't added any content to their brain.</p>
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {data.content.map(item => (
              <Card
                key={item.id}
                type={item.type}
                title={item.title}
                link={item.link}
                tags={item.tags}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareContent;
