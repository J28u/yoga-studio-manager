import { useState, useEffect, JSX, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { authService } from "../services/auth.service";
import { ApiSuccessResponse, Session } from "../types";
import axios from "axios";

const Sessions = (): JSX.Element => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const user = authService.getCurrentUser();
  const token = authService.getToken();

  const fetchSessions = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get<Session[]>("/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        });
        setSessions(response.data);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setError("Failed to load sessions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSessions(controller.signal); //
    return () => controller.abort();
  }, [fetchSessions]);

  const handleDelete = async (sessionId: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await api.delete<ApiSuccessResponse>(`/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSessions();
    } catch (err: unknown) {
      alert("Failed to delete session");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1
            data-cy="sessions-title"
            className="text-3xl font-bold text-gray-800"
          >
            Yoga Sessions
          </h1>
          {user && user.admin && (
            <Link
              to="/sessions/create"
              data-cy="create-session-link"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Create Session
            </Link>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No sessions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session: Session) => (
              <div
                key={session.id}
                data-cy={`session-${session.id}`}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {session.name}
                </h3>
                <p className="text-gray-600 mb-2">
                  Date: {new Date(session.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-2">
                  Teacher: {session.teacher.firstName}{" "}
                  {session.teacher.lastName}
                </p>
                <p className="text-gray-600 mb-4">
                  Participants: {session.users.length}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3 flex-1">
                  {session.description}
                </p>

                <div className="flex space-x-2">
                  <Link
                    to={`/sessions/${session.id}`}
                    data-cy={`session-${session.id}-details-link`}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded text-center hover:bg-indigo-700"
                  >
                    View Details
                  </Link>

                  {user && user.admin && (
                    <button
                      onClick={() => handleDelete(session.id)}
                      data-cy={`session-${session.id}-delete-button`}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
