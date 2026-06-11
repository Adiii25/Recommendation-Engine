require("dotenv").config();

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY EXISTS:", !!process.env.SUPABASE_KEY);
const express = require("express");
const cors = require("cors");

const supabase = require("./supabase");

const app = express();


app.use(cors());
app.use(express.json());

function getRecommendation(data) {
  const qualification = data.qualification.toLowerCase();
  const experience = Number(data.experience);

  if (experience >= 15) {
    return "Honorary Doctorate";
  }

  if (qualification.includes("12")) {
    return "Certification Program";
  }

  if (qualification.includes("diploma")) {
    return "Advanced Certification Program";
  }

  if (qualification.includes("bachelor")) {
    if (experience < 2) return "Professional Certification";
    return "MBA";
  }

  if (qualification.includes("master")) {
    if (experience >= 5) return "PhD";
    return "Research Fellowship";
  }

  return "Certification Program";
}

app.post("/submit", async (req, res) => {
  try {
    const recommendation = getRecommendation(req.body);

    const { error } = await supabase
      .from("submissions")
      .insert([
        {
          name: req.body.name,
          email: req.body.email,
          qualification: req.body.qualification,
          experience: req.body.experience,
          profession: req.body.profession,
          career_goal: req.body.careerGoal,
          recommendation,
        },
      ]);

    if (error) throw error;

    res.json({
      recommendation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/submissions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/test", async (req, res) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  res.json({ data, error });
});

app.delete("/submissions/:id", async (req, res) => {
  try {
    console.log("Trying to delete ID:", req.params.id);

    const { data, error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", req.params.id)
      .select();

    console.log("Deleted data:", data);
    console.log("Delete error:", error);

    if (error) throw error;

    res.json({
      success: true,
      deleted: data,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});