import React from 'react';
import { MessageCircle, Video, FileText, Link as LinkIcon, Hash, BrainCircuit, LogOut, LayoutGrid } from 'lucide-react';


interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onLogout: () => void;
  contentCounts:number
}

export const Sidebar = ({ activeFilter, onFilterChange, onLogout,contentCounts }: SidebarProps) => {
  
  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <BrainCircuit color="var(--primary)" size={28} />
        <span>Second Brain</span>
      </div>

      <div className="sidebar-nav">
        <a className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => onFilterChange('all')}>
          <LayoutGrid size={20} />
          <span>All Notes</span>
        </a>

        <a className={`nav-item ${activeFilter === 'tweet' ? 'active' : ''}`} onClick={() => onFilterChange('tweet')}>
          <MessageCircle size={20} />
          <span>Tweets</span>
        </a>


        <a className={`nav-item ${activeFilter === 'youtube' ? 'active' : ''}`} onClick={() => onFilterChange('youtube')}>
          <Video size={20} />
          <span>Videos</span>
        </a>


        <a className={`nav-item ${activeFilter === 'document' ? 'active' : ''}`} onClick={() => onFilterChange('document')}>
          <FileText size={20} />
          <span>Documents</span>
        </a>


        <a className={`nav-item ${activeFilter === 'link' ? 'active' : ''}`} onClick={() => onFilterChange('link')}>
          <LinkIcon size={20} />
          <span>Links</span>
        </a>
      </div>

      <div style={{ flex: 1 }} />
      <div className="sidebar-nav" style={{ paddingBottom: '24px' }}>
        <a className="nav-item" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>

    </div>
  );
};
