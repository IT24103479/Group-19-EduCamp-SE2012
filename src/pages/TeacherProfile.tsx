import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// Example teachers array (you can import this from another file instead)
const teachers = [
  {
    id: 1,
    name: "Mr. Anuradha Lakmal",
    subject: "Maths",
    email: "anuradhamath@gmail.com",
    phone: "0703456203",
    image:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=774&auto=formathttps://plus.unsplash.com/premium_photo-1683134169138-9037062cba51?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&fit=crop",
    qualifications: "School teacher",
  },
  {
    id: 2,
    name: "Ms. Disna Chandrasena",
    subject: "Maths",
    email: "disna1998@gmail.com",
    phone: "0701327892",
    image:
      "https://plus.unsplash.com/premium_photo-1682089789852-e3023ff6df24?q=80&w=871&auto=format&fit=crop",
    qualifications: "Diploma in Mathematics",
  },
 {
    id: 3,
    name: "Mr. Janaka Nayanapriyaa",
    subject: "Science",
    email: "janka23@gmail.com",
    phone: "0701329073",
    image:
      "https://plus.unsplash.com/premium_photo-1661488726815-74c4ed2513f5?w=500&auto=format&fit=crop&q=60",
    qualifications: "Diploma in Science",
  },
  {
    id: 4,
    name: "Mr. Chandana Disanayaka",
    subject: "Science",
    email: "chandana202@gmail.com",
    phone: "0701270734",
    image:
      "https://images.unsplash.com/flagged/photo-1559475555-b26777ed3ab4?w=500&auto=format&fit=crop&q=60",
    qualifications: "Diploma in Science",
  },
  {
    id: 5,
    name: "Mr. S. Dayalan",
    subject: "English and English Literature",
    email: "dayala444@gmail.com",
    phone: "0712570730",
    image:
      "https://images.unsplash.com/photo-1715889680234-b5e250d78e28?q=80&w=468&auto=format&fit=crop",
    qualifications: "Special Degree in Translations",
  },
  {
    id: 6,
    name: "Mr. Suranga Wanninayaka",
    subject: "English",
    email: "surang2004@gmail.com",
    phone: "0712529736",
    image: "https://images.pexels.com/photos/7092613/pexels-photo-7092613.jpeg",
    qualifications: "B.A. English Trained",
  },
  {
    id: 7,
    name: "Mr. Nalin S. Kulathunga",
    subject: "Business and Accounting",
    email: "kulath04@gmail.com",
    phone: "0712529736",
    image: "https://images.pexels.com/photos/6325952/pexels-photo-6325952.jpeg",
    qualifications: "BSc. (Mgt.) Accountancy (Sp.)",
  },
  {
    id: 8,
    name: "Mr. Harsha Mahesh",
    subject: "ICT",
    email: "harshaict@gmail.com",
    phone: "0712891067",
    image: "https://images.pexels.com/photos/6325952/pexels-photo-6325952.jpeg",
    qualifications: "Diploma in ICT",
  },
  {
    id: 9,
    name: "Mr. S.A.M. Risvan",
    subject: "Tamil",
    email: "kulath04@gmail.com",
    phone: "0712529736",
    image: "https://images.pexels.com/photos/15835601/pexels-photo-15835601.jpeg",
    qualifications: "Special Tamil Trained",
  },
  {
    id: 10,
    name: "Ms. Janitha Aberathna",
    subject: "Dancing",
    email: "dancing22@gmail.com",
    phone: "0719352017",
    image:
      "https://images.unsplash.com/photo-1559091305-e82049da0ee8?q=80&w=474&auto=format&fit=crop",
    qualifications: "Special Degree in Dance",
  },
  {
    id: 11,
    name: "Mr. Saman Kumara",
    subject: "Drama",
    email: "drama233@gmail.com",
    phone: "0715089017",
    image:
      "https://images.unsplash.com/photo-1627729085140-e0912b70e79e?q=80&w=387&auto=format&fit=crop",
    qualifications: "School Teacher",
  },
  {
    id: 12,
    name: "Ms. Vathsala Senavirathna",
    subject: "Maths (E.M)",
    email: "vathsalamaths@gmail.com",
    phone: "0715055342",
    image:
      "https://images.unsplash.com/photo-1758874089586-4e37e94f446a?q=80&w=1032&auto=format&fit=crop",
    qualifications: "Diploma in Teaching",
  },
];

const TeacherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const teacher = teachers.find((t) => t.id === Number(id));

  if (!teacher)
    return (
      <div className="text-center mt-12">
        <p className="text-slate-600">Teacher not found.</p>
        <Link to="/teachers" className="text-emerald-500 underline">
          Back
        </Link>
      </div>
    );
  const navigate = useNavigate();

  // ✅ Inserted updated UI here
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <img
        src={teacher.image}
        alt={teacher.name}
        className="w-full h-64 object-cover rounded-lg shadow"
      />

      <h1 className="text-3xl font-bold mt-6">{teacher.name}</h1>
      <p className="text-lg text-slate-600">{teacher.subject}</p>

      <div className="mt-4 space-y-2">
        <p>
          <span className="font-semibold">Qualifications:</span>{" "}
          {teacher.qualifications}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {teacher.email}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> {teacher.phone}
        </p>
      </div>
      <Link to="/teachers">
        <button className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
          Back to Teachers
        </button>
      </Link>
    </div>
  );
};

export default TeacherProfile;
