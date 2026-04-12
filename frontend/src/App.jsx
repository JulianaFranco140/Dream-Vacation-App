import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [destinations, setDestinations] = useState([]);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setErrorMessage('');
    try {
      const response = await axios.get(`${API_URL}/api/destinations`);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setErrorMessage('Could not load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/destinations`, { country });
      setCountry('');
      await fetchDestinations();
    } catch (error) {
      console.error('Error adding destination:', error);
      setErrorMessage('Could not add destination. Please verify the country name.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    try {
      await axios.delete(`${API_URL}/api/destinations/${id}`);
      await fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      setErrorMessage('Could not remove destination. Please try again.');
    }
  };

  const formatPopulation = (population) => {
    if (typeof population !== 'number') {
      return 'N/A';
    }

    return population.toLocaleString();
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body bg-primary bg-gradient text-white rounded">
                <h1 className="h2 mb-1">Dream Vacation Destinations</h1>
                <p className="mb-0 text-white-50">Plan your next trip and track your favorite countries.</p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-2 align-items-center">
                    <div className="col-md-9">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter a country (e.g. Japan, Colombia, Italy)"
                        required
                      />
                    </div>
                    <div className="col-md-3 d-grid">
                      <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add Destination'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0 text-secondary">Saved Destinations</h2>
                <span className="badge text-bg-primary">{destinations.length}</span>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="p-4 text-center text-secondary">Loading destinations...</div>
                ) : destinations.length === 0 ? (
                  <div className="p-4 text-center text-secondary">No destinations yet. Add your first one above.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 align-middle">
                      <thead className="table-dark">
                      <tr>
                        <th scope="col">Country</th>
                        <th scope="col">Capital</th>
                        <th scope="col">Population</th>
                        <th scope="col">Region</th>
                        <th scope="col">Languages</th>
                        <th scope="col" className="text-end">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {destinations.map((dest) => (
                        <tr key={dest.id}>
                          <td className="fw-semibold">{dest.country || 'N/A'}</td>
                          <td>{dest.capital || 'N/A'}</td>
                          <td>{formatPopulation(dest.population)}</td>
                          <td>
                            <span className="badge rounded-pill text-bg-info">{dest.region || 'N/A'}</span>
                          </td>
                          <td>{dest.languages || 'N/A'}</td>
                          <td className="text-end">
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(dest.id)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;