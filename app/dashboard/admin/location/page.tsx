"use client";
import { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";


interface Location {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdAt: string;
}

export default function InstituteLocationForm() {
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "200",
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/institute-location");
      const data = await res.json();
      if (data.success) setLocations(data.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? {
          id: editingId,
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radius: parseInt(form.radius),
        }
        : {
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radius: parseInt(form.radius),
        };

      const res = await fetch("/api/institute-location", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        alert(editingId ? "Location updated!" : "Location added!");
        resetForm();
        fetchLocations();
      } else {
        alert(data.message || `Failed to ${editingId ? "update" : "add"} location`);
      }
    } catch (error) {
      alert(`Error ${editingId ? "updating" : "adding"} location`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: Location) => {
    setForm({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString(),
    });
    setEditingId(location._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const res = await fetch(`/api/institute-location?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Location deleted successfully!");
        fetchLocations();
      } else {
        alert(data.message || "Failed to delete location");
      }
    } catch (error) {
      alert("Error deleting location");
    }
  };

  const resetForm = () => {
    setForm({ name: "", latitude: "", longitude: "", radius: "200" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleFetchLocation = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // ✅ Use Capacitor plugin in Android/iOS
        const perm = await Geolocation.requestPermissions();
        if (perm.location === "denied") {
          alert("Location permission denied");
          return;
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
        setForm({
          ...form,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        });
      } else if ("geolocation" in navigator) {
        // ✅ Browser fallback
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setForm({
              ...form,
              latitude: pos.coords.latitude.toString(),
              longitude: pos.coords.longitude.toString(),
            }),
          (err) => alert("Failed to fetch location: " + err.message),
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation not supported");
      }
    } catch (err: any) {
      alert("Failed to fetch location: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
              </button>
              <MapPinIcon className="h-8 w-8 text-blue-600" />

            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>{showForm ? "Cancel" : "Add Location"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {editingId ? "Edit Location" : "Add New Location"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter location name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        placeholder="0.000000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="any"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        placeholder="0.000000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="any"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>Use Current Location</span>
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Radius (meters)
                    </label>
                    <input
                      type="number"
                      name="radius"
                      value={form.radius}
                      onChange={handleChange}
                      placeholder="200"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading
                        ? "Saving..."
                        : editingId
                          ? "Update Location"
                          : "Add Location"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Locations List */}
          <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Locations ({locations.length})
                </h2>
              </div>

              {locations.length === 0 ? (
                <div className="p-12 text-center">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No locations added yet</p>
                  <p className="text-gray-400">Add your first location to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {locations.map((location) => (
                    <div
                      key={location._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <MapPinIcon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {location.name}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Coordinates:</span>
                              <br />
                              {location.latitude.toFixed(6)},{" "}
                              {location.longitude.toFixed(6)}
                            </div>
                            <div>
                              <span className="font-medium">Radius:</span>
                              <br />
                              {location.radius} meters
                            </div>
                            <div>
                              <span className="font-medium">Added:</span>
                              <br />
                              {new Date(location.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(location)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit location"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(location._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete location"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
