import React, { useState } from 'react'


interface AddContentModalProps {
  onClose:()=>void;
  onAdd: (data: { type: string; link: string; title: string; tags: string[] }) => void;
}
export const AddContentModal = ({onClose, onAdd}:AddContentModalProps) => {
  const [type, setType] = useState('document');
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e:React.FormEvent)=>{
   e.preventDefault();
   const tags= tagsInput.split(",").map(t=>t.trim()).filter(Boolean);
   onAdd({ type, link, title, tags });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add New Content</div>
          <button className="close-btn" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input"  value={type} onChange={e=>setType(e.target.value)}>
              <option value="document">Document</option>
              <option value="tweet">Tweet</option>
              <option value="youtube">YouTube</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="My awesome resource"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link / URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={link}
              onChange={e=>setLink(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="productivity, learning"
              value={tagsInput}
              onChange={e=>setTagsInput(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Add Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
