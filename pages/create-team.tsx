import { useEffect, useState } from "react";
import { OrganizationSwitcher, useAuth } from "@clerk/nextjs";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ManageTeams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth(); // ✅ to get auth token

  useEffect(() => {
    const fetchMembers = async () => {
      const token = await getToken({ template: "default" }); // ✅

console.log("Clerk session token:", token);

      try {
        const token = await getToken(); // ✅ fetch token
        const res = await fetch("/api/members", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ pass it in header
          },
        });
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [getToken]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/manage-teams" />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-600">No members found in this organization.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {members.map((member) => (
            <li key={member.id} className="py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                  {member.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
