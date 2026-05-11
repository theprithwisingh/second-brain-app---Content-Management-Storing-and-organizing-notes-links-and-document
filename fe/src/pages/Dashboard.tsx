import axios from "axios";
import { Plus, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";

const API_BASE = "http://localhost:3001/api/v1";

interface ContentType {
  _id: string;
  type: "document" | "tweet" | "youtube" | "link";
  title: string;
  link?: string;
  tags: string[];
}

const Dashboard = () => {

  const [content, setContent] = useState<ContentType[]>([]);

  const navigate = useNavigate();

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchContent = async () => {

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {

      const res = await axios.get(`${API_BASE}/content`, {
        headers: {
          Authorization: token
        }
      });

      console.log("API Response:", res.data);

      setContent(res.data.content);

    } catch (err: any) {

      console.log(err);

      if (err.response?.status === 403) {

        localStorage.removeItem("token");

        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="app-container">

      <main className="main-content">

        <div className="page-header">

          <h1 className="page-title">
            All Notes
          </h1>

          <div className="header-actions">

            <button className="btn btn-secondary">
              <Share2 size={18} />
              Share Brain
            </button>

            <button className="btn btn-primary">
              <Plus size={18} />
              Add Content
            </button>

          </div>

        </div>

        {content.length === 0 ? (

          <div>
            No content found
          </div>

        ) : (

          <div className="card-grid">

            {content.map((item) => (
              <Card
                key={item._id}
                type={item.type}
                title={item.title}
                link={item.link}
                tags={item.tags}
              />
            ))}

          </div>

        )}

      </main>

    </div>
  );
};

export default Dashboard;