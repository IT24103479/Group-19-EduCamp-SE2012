import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { Search, Filter } from "lucide-react";

interface ClassCardProps {
  classItem: ClassItem;
  index: number;
}

interface ClassItem {
  id: number;
  name: string;
  type: string;
  description: string;
  image: string;
  schedule: string;
  duration: string;
  capacity: number;
  location: string;
  price: string;
}

const Classes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const classes: ClassItem[] = [
    {
      id: 1,
      name: "Advanced Mathematics Class",
      type: "Regular",
      description:
        "Comprehensive mathematics program focusing on problem-solving and analytical thinking.",
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Mon, Wed, Fri - 4:00 PM",
      duration: "2 hours",
      capacity: 25,
      location: "Room A-101",
      price: "15,000",
    },
    {
      id: 2,
      name: "Science Laboratory Sessions",
      type: "Practical",
      description:
        "Hands-on laboratory experience with physics, chemistry, and biology experiments.",
      image:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Tue, Thu - 3:00 PM",
      duration: "3 hours",
      capacity: 20,
      location: "Science Lab",
      price: "18,000",
    },
    {
      id: 3,
      name: "English Literature Workshop",
      type: "Workshop",
      description:
        "Interactive sessions focusing on literature analysis and creative writing skills.",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Sat - 10:00 AM",
      duration: "4 hours",
      capacity: 30,
      location: "Room B-205",
      price: "12,000",
    },
    {
      id: 4,
      name: "History Discussion Circle",
      type: "Discussion",
      description:
        "Interactive discussions on historical events and their impact on modern society.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Wed - 5:00 PM",
      duration: "1.5 hours",
      capacity: 15,
      location: "Room C-301",
      price: "10,000",
    },
    {
      id: 5,
      name: "Geography Field Studies",
      type: "Field Trip",
      description:
        "Outdoor learning experiences with field trips and environmental studies.",
      image:
        "https://images.unsplash.com/photo-1597149962419-0d900ac2e4c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Sat - 8:00 AM",
      duration: "6 hours",
      capacity: 20,
      location: "Various Locations",
      price: "10,000",
    },
    {
      id: 6,
      name: "IT Programming Bootcamp",
      type: "Intensive",
      description:
        "Intensive programming sessions covering web development and software engineering.",
      image:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      schedule: "Daily - 2:00 PM",
      duration: "3 hours",
      capacity: 15,
      location: "Computer Lab",
      price: "20,000",
    },
  ];

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || classItem.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = [...new Set(classes.map((classItem) => classItem.type))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Classes</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join our diverse range of classes designed to enhance your learning
            experience
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((classItem, index) => (
            <ClassCard key={classItem.id} classItem={classItem} index={index} />
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              No classes found matching your criteria.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Classes;
