"use client";

import React from "react"

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Code2,
  Briefcase,
  X,
} from "lucide-react";
import Link from "next/link";

const LANGUAGE_OPTIONS = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
  "SQL",
  "R",
  "C",
  "C#",
  "Swift",
  "Kotlin",
  "Ruby",
  "PHP",
  "Scala",
  "Haskell",
  "MATLAB",
];

const FRAMEWORK_OPTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "Django",
  "Flask",
  "Spring Boot",
  "Express",
  "Vue.js",
  "Angular",
  "TensorFlow",
  "PyTorch",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "Tailwind CSS",
  "Git",
];

const TECHNICAL_SKILL_OPTIONS = [
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "System Design",
  "Web Development",
  "Mobile Development",
  "Data Analysis",
  "Cloud Computing",
  "DevOps",
  "CI/CD",
  "REST APIs",
  "Databases",
  "Testing",
  "Agile/Scrum",
  "UI/UX Design",
  "Computer Vision",
  "NLP",
  "Distributed Systems",
];

function TagSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onToggle(opt)}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {opt}
              {isSelected && <X className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground/60">
          {selected.length} selected
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  // Education
  const [school, setSchool] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");

  // Skills
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);

  // Experience
  const [gpa, setGpa] = useState("");
  const [coursework, setCoursework] = useState("");
  const [projects, setProjects] = useState("");
  const [workExperience, setWorkExperience] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setSchool(data.school || "");
        setGraduationYear(data.graduation_year?.toString() || "");
        setMajor(data.major || "");
        setMinor(data.minor || "");
        setLanguages(data.programming_languages || []);
        setFrameworks(data.frameworks || []);
        setTechnicalSkills(data.technical_skills || []);
        setGpa(data.gpa?.toString() || "");
        setCoursework(data.coursework || "");
        setProjects(data.projects || "");
        setWorkExperience(data.work_experience || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const toggleItem = useCallback(
    (
      list: string[],
      setList: React.Dispatch<React.SetStateAction<string[]>>,
      item: string
    ) => {
      setList(
        list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
      );
    },
    []
  );

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        id: user.id,
        school: school || null,
        graduation_year: graduationYear ? parseInt(graduationYear) : null,
        major: major || null,
        minor: minor || null,
        programming_languages: languages.length > 0 ? languages : null,
        frameworks: frameworks.length > 0 ? frameworks : null,
        technical_skills: technicalSkills.length > 0 ? technicalSkills : null,
        gpa: gpa ? parseFloat(gpa) : null,
        coursework: coursework || null,
        projects: projects || null,
        work_experience: workExperience || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "id" });

      if (error) throw error;
      toast.success("Profile saved successfully");
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) =>
    (currentYear + i - 1).toString()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile data is used to personalize fit scores and find alumni
            connections
          </p>
        </div>

        <div className="space-y-6">
          {/* Education Section */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Education
                </h2>
                <p className="text-xs text-muted-foreground">
                  Used to find alumni connections at target companies
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school" className="text-sm text-foreground">
                  School / University
                </Label>
                <Input
                  id="school"
                  placeholder="e.g. Claremont McKenna College, MIT, Stanford"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major" className="text-sm text-foreground">
                    Major
                  </Label>
                  <Input
                    id="major"
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minor" className="text-sm text-foreground">
                    Minor (optional)
                  </Label>
                  <Input
                    id="minor"
                    placeholder="e.g. Mathematics"
                    value={minor}
                    onChange={(e) => setMinor(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="graduation-year"
                    className="text-sm text-foreground"
                  >
                    Expected Graduation
                  </Label>
                  <Select
                    value={graduationYear}
                    onValueChange={setGraduationYear}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa" className="text-sm text-foreground">
                    GPA (optional)
                  </Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="e.g. 3.75"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Code2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Technical Skills
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select your skills to get personalized fit scores
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <TagSelect
                label="Programming Languages"
                options={LANGUAGE_OPTIONS}
                selected={languages}
                onToggle={(item) => toggleItem(languages, setLanguages, item)}
              />
              <TagSelect
                label="Frameworks & Tools"
                options={FRAMEWORK_OPTIONS}
                selected={frameworks}
                onToggle={(item) =>
                  toggleItem(frameworks, setFrameworks, item)
                }
              />
              <TagSelect
                label="Technical Skills"
                options={TECHNICAL_SKILL_OPTIONS}
                selected={technicalSkills}
                onToggle={(item) =>
                  toggleItem(technicalSkills, setTechnicalSkills, item)
                }
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Briefcase className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Experience
                </h2>
                <p className="text-xs text-muted-foreground">
                  Helps AI compare your background against role requirements
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="coursework"
                  className="text-sm text-foreground"
                >
                  Relevant Coursework
                </Label>
                <Textarea
                  id="coursework"
                  placeholder="e.g. Data Structures, Algorithms, Machine Learning, Operating Systems, Database Systems"
                  value={coursework}
                  onChange={(e) => setCoursework(e.target.value)}
                  rows={2}
                  className="bg-background border-border resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects" className="text-sm text-foreground">
                  Key Projects (describe 2-3)
                </Label>
                <Textarea
                  id="projects"
                  placeholder="e.g. Built a full-stack e-commerce app with React/Node.js. Created a ML model for sentiment analysis achieving 92% accuracy. Developed a mobile app for campus events with 500+ users."
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  rows={4}
                  className="bg-background border-border resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="work-experience"
                  className="text-sm text-foreground"
                >
                  Past Internships / Work Experience
                </Label>
                <Textarea
                  id="work-experience"
                  placeholder="e.g. Software Engineering Intern at Startup XYZ (Summer 2025) - Built REST APIs and React dashboard. Teaching Assistant for CS101 - Helped 200+ students with Python."
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  rows={4}
                  className="bg-background border-border resize-none"
                />
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-6 py-4">
            <p className="text-xs text-muted-foreground">
              This data personalizes your fit scores and networking suggestions
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
