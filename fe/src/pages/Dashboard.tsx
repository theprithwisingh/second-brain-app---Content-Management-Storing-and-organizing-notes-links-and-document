import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/Card';
import { AddContentModal } from '../components/AddContentModal';
import { Sidebar } from '../components/Sidebar';
import { ShareBrainModal } from '../components/ShareBrainModal';
import { Share2 } from 'lucide-react';

const API_BASE = "http://localhost:3001/api/v1";

interface ContentType {
  id: string;
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  link?: string;
  tags: string[]
}

const Dashboard = () => {
  const [content, setContent] = useState<ContentType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Compute Content Counts for Sidebar
  const contentCounts = {
    all: content.length,
    tweet: content.filter(c => c.type === 'tweet').length,
    youtube: content.filter(c => c.type === 'youtube').length,
    document: content.filter(c => c.type === 'document').length,
    link: content.filter(c => c.type === 'link').length,
  };

  // Filter content based on active filter
  const filteredContent = activeFilter === 'all' 
    ? content 
    : content.filter(c => c.type === activeFilter);

  // Fetch content from API
  const fetchContent = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${API_BASE}/content`, {
      headers: { 'Authorization': token }
    })
      .then(res => setContent(res.data?.content || []))
      .catch(err => {
        console.error('Failed to fetch content:', err);
        if (err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      });
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Add content to API
  const handleAdd = (data: { type: string; link: string; title: string; tags: string[] }) => {
    const token = localStorage.getItem('token');

    axios.post(`${API_BASE}/content`, data, {
      headers: { 'Authorization': token }
    })
      .then(() => {
        setShowModal(false);
        fetchContent();
      })
      .catch(err => console.error('Failed to add content:', err));
  };

  // Generate share link
  const handleShare = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_BASE}/brain/share`, { share: true }, {
        headers: { 'Authorization': token }
      });
      // Build the full shareable URL
      const fullLink = `${window.location.origin}/share/${res.data.link}`;
      setShareLink(fullLink);
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  };

  // Disable share link
  const handleDisableShare = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE}/brain/share`, { share: false }, {
        headers: { 'Authorization': token }
      });
      setShareLink(undefined);
      setShowShareModal(false);
      alert('Share link has been successfully disabled.');
    } catch (err) {
      console.error('Failed to disable share link:', err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onLogout={handleLogout}
        contentCounts={contentCounts}
      />
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Content</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
              <Share2 size={18} />
              Share Brain
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Content
            </button>
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2 className="empty-title">No content yet</h2>
              <p className="empty-subtitle">Add some content to get started building your second brain.</p>
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {filteredContent.map(item => (
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

      {showModal && (
        <AddContentModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {showShareModal && (
        <ShareBrainModal
          onClose={() => {
            setShowShareModal(false);
            setShareLink(undefined);
          }}
          shareLink={shareLink}
          onShare={handleShare}
          onDisableShare={handleDisableShare}
          itemCount={content.length}
        />
      )}
    </div>
  )
}
export default Dashboard
