import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  createTheme,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  CircuitBoard,
  Compass,
  Download,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Rocket,
  Search,
  Target,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Treemap,
  XAxis,
  YAxis,
} from "recharts";

/* ===========================
   DATA IMPORTS
   =========================== */
import p1 from "../data/prompt1.json";
import p2 from "../data/prompt2.json";
import p3 from "../data/prompt3.json";
import p4 from "../data/prompt4.json";
import p5 from "../data/prompt5.json";
import p6 from "../data/prompt6.json";
import p7 from "../data/prompt7.json";
import p8 from "../data/prompt8.json";

// Markdown imported as raw strings (Vite supports ?raw)
import md1 from "../prompts/prompt1.md?raw";
import md2 from "../prompts/prompt2.md?raw";
import md3 from "../prompts/prompt3.md?raw";
import md4 from "../prompts/prompt4.md?raw";
import md5 from "../prompts/prompt5.md?raw";
import md6 from "../prompts/prompt6.md?raw";
import md7 from "../prompts/prompt7.md?raw";
import md8 from "../prompts/prompt8.md?raw";

/* ===========================
   THEME: Dark UI, palette, typography
   =========================== */
const colors = {
  bg: "#222428",
  text: "#FAFAFA",
  magna: "#E22E2F",
  green: "#8FFF00",
  silver: "#CCCCCC",
  blue: "#3175D4",
  orange: "#DA6E44",
  charcoal: "#333333",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: colors.bg, paper: "#1c1e22" },
    text: { primary: colors.text, secondary: colors.silver },
    primary: { main: colors.green },
    secondary: { main: colors.blue },
    error: { main: colors.orange },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },
});

/* ===========================
   UTILITIES
   =========================== */
// Extract a heading-like label from the first line of markdown,
// taking content after the first colon and stripping "(ENHANCED)".
function extractHeading(md) {
  if (!md) return "Untitled";
  const firstLine = (
    md.split(/\r?\n/).find((l) => l.trim().length > 0) || ""
  ).trim();
  const afterColon = firstLine.includes(":")
    ? firstLine.split(":").slice(1).join(":").trim()
    : firstLine;
  return afterColon.replace(/\(ENHANCED\)/gi, "").trim() || "Untitled";
}

const headings = [
  extractHeading(md1),
  extractHeading(md2),
  extractHeading(md3),
  extractHeading(md4),
  extractHeading(md5),
  extractHeading(md6),
  extractHeading(md7),
  extractHeading(md8),
];

function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h] ?? "";
          const s = typeof v === "string" ? v.replace(/"/g, '""') : String(v);
          return `"${s}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function pctToNumber(pct) {
  if (typeof pct === "number") return pct;
  if (typeof pct === "string") {
    const m = pct.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
}

/* Tokenizer and similarity helpers (no external data used) */
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "by",
  "we",
  "our",
  "is",
  "are",
  "be",
  "that",
  "this",
  "as",
  "into",
  "from",
  "at",
  "all",
  "more",
  "new",
  "next",
  "future",
  "towards",
  "toward",
  "through",
  "across",
  "their",
  "its",
  "it",
  "it’s",
  "will",
  "can",
  "make",
  "create",
  "provide",
  "providing",
  "enable",
  "enabling",
  "deliver",
  "delivering",
  "world",
  "mobility",
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w));
}

function jaccardSimilarity(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...a, ...b]).size || 1;
  return inter / union;
}

/* ===========================
   LAYOUT: Sidebar + Nav Items
   =========================== */
const drawerWidth = 300;

const navItems = [
  { label: headings[0] || "Dashboard 1", icon: <LayoutDashboard size={18} /> },
  { label: headings[1] || "Dashboard 2", icon: <BarChart3 size={18} /> },
  { label: headings[2] || "Dashboard 3", icon: <Activity size={18} /> },
  { label: headings[3] || "Dashboard 4", icon: <Compass size={18} /> },
  { label: headings[4] || "Dashboard 5", icon: <Target size={18} /> },
  { label: headings[5] || "Dashboard 6", icon: <Lightbulb size={18} /> },
  { label: headings[6] || "Dashboard 7", icon: <Rocket size={18} /> },
  { label: headings[7] || "Integration Hub", icon: <CircuitBoard size={18} /> },
];

/* ===========================
   PAGE 1: Brand Platform Foundation
   Data: data/prompt1.json
   Sections: Mission, Vision, Purpose, Values, Positioning, Themes, Promise, Taglines
   =========================== */
function Page1() {
  const data = p1?.interactiveComponents || {};
  const [q, setQ] = useState("");
  const allBrands = useMemo(
    () => (data.missionComparisonMatrix || []).map((d) => d.brandName),
    [data.missionComparisonMatrix]
  );
  const [selectedBrands, setSelectedBrands] = useState(allBrands);
  const [showSimilarity, setShowSimilarity] = useState(true);
  const [showMagnaPanel, setShowMagnaPanel] = useState(true);
  const [expandedCards, setExpandedCards] = useState({}); // key: brandName-section

  const brandFilter = (arr) =>
    (arr || []).filter((x) => selectedBrands.includes(x.brandName));

  const textMatch = (str) =>
    (str || "").toLowerCase().includes(q.toLowerCase());

  const mission = brandFilter(
    (data.missionComparisonMatrix || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.mission)
    )
  );
  const vision = brandFilter(
    (data.visionComparisonMatrix || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.vision)
    )
  );
  const purpose = brandFilter(
    (data.purposeComparisonMatrix || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.purpose)
    )
  );
  const values = brandFilter(
    (data.valuesExplorer || []).filter(
      (x) =>
        textMatch(x.brandName) || (x.values || []).some((v) => textMatch(v))
    )
  );
  const positions = brandFilter(
    (data.positioningStatementCards || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.positioningStatement)
    )
  );
  const themes = brandFilter(
    (data.keyThemesVisualization || []).filter(
      (x) =>
        textMatch(x.brandName) || (x.themes || []).some((t) => textMatch(t))
    )
  );
  const promises = brandFilter(
    (data.brandPromiseDisplay || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.promise)
    )
  );
  const taglines = brandFilter(
    (data.taglineGallery || []).filter(
      (x) => textMatch(x.brandName) || textMatch(x.tagline)
    )
  );

  const valuesBar = (values || []).map((v) => ({
    brand: v.brandName,
    count: (v.values || []).length,
    color: v.color || undefined,
  }));

  // Theme frequency across selected brands
  const themeFrequency = useMemo(() => {
    const freq = {};
    (themes || []).forEach((t) => {
      (t.themes || []).forEach((th) => {
        freq[th] = (freq[th] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [themes]);

  // Mission similarity matrix across selected brands (Jaccard over tokens)
  const missionTokens = useMemo(() => {
    const map = {};
    (mission || []).forEach((m) => (map[m.brandName] = tokenize(m.mission)));
    return map;
  }, [mission]);

  const missionSimilarity = useMemo(() => {
    const brands = mission.map((m) => m.brandName);
    const rows = brands.map((b1) =>
      brands.map((b2) =>
        b1 === b2
          ? 1
          : jaccardSimilarity(missionTokens[b1] || [], missionTokens[b2] || [])
      )
    );
    return { brands, rows };
  }, [mission, missionTokens]);

  // Common mission keywords across selected brands (appear in >= 3 brands)
  const commonKeywords = useMemo(() => {
    const appear = {};
    (mission || []).forEach((m) => {
      const set = new Set(tokenize(m.mission));
      set.forEach((w) => (appear[w] = (appear[w] || 0) + 1));
    });
    const threshold = Math.max(3, Math.floor((mission || []).length / 2));
    return new Set(
      Object.entries(appear)
        .filter(([, c]) => c >= threshold)
        .map(([w]) => w)
    );
  }, [mission]);

  const highlightCommon = (text) => {
    const parts = (text || "").split(/(\s+)/);
    return parts.map((p, i) => {
      const t = p.replace(/[^a-z0-9]/gi, "").toLowerCase();
      if (commonKeywords.has(t)) {
        return (
          <span
            key={i}
            style={{
              background: "#3175D422",
              borderBottom: `1px dashed ${colors.blue}`,
            }}
          >
            {p}
          </span>
        );
      }
      return <span key={i}>{p}</span>;
    });
  };

  const toggleExpand = (key) =>
    setExpandedCards((s) => ({ ...s, [key]: !s[key] }));

  const exportAll = () => {
    downloadCSV("missions.csv", mission);
    downloadCSV("visions.csv", vision);
    downloadCSV("purposes.csv", purpose);
    downloadCSV(
      "values.csv",
      (values || []).map((v) => ({
        brandName: v.brandName,
        values: (v.values || []).join(" | "),
      }))
    );
    downloadCSV(
      "positioning.csv",
      (positions || []).map((v) => ({
        brandName: v.brandName,
        positioningStatement: v.positioningStatement,
      }))
    );
    downloadCSV(
      "themes.csv",
      (themes || []).map((v) => ({
        brandName: v.brandName,
        themes: (v.themes || []).join(" | "),
      }))
    );
    downloadCSV(
      "promises.csv",
      (promises || []).map((v) => ({
        brandName: v.brandName,
        promise: v.promise,
      }))
    );
    downloadCSV(
      "taglines.csv",
      (taglines || []).map((v) => ({
        brandName: v.brandName,
        tagline: v.tagline,
      }))
    );
  };

  const exportPDF = () => {
    window.print();
  };

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  // Ensure readable labels on Value-laden Frequencies (Treemap)
  const ValueTreemapContent = (props) => {
    const { x, y, width, height, name } = props;
    const w = Math.max(0, width || 0);
    const h = Math.max(0, height || 0);
    const fontSize = Math.max(10, Math.min(16, Math.min(w, h) / 10));
    const canShow = w >= 60 && h >= 24;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          style={{ fill: colors.green, stroke: "#333" }}
        />
        {canShow ? (
          <text
            x={x + w / 2}
            y={y + h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#111"
            style={{ pointerEvents: "none", fontWeight: 700 }}
            fontSize={fontSize}
          >
            {name}
          </text>
        ) : null}
      </g>
    );
  };

  // Magna insights (from this dataset only)
  const magnaMission = mission.find((x) => x.color);
  const magnaVision = vision.find((x) => x.color);
  const magnaPurpose = purpose.find((x) => x.color);
  const magnaValues = values.find((x) => x.color);
  const magnaThemes = themes.find((x) => x.color);
  const magnaPromise = promises.find((x) => x.color);
  const magnaTagline = taglines.find((x) => x.color);

  return (
    <Stack spacing={3}>
      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, minWidth: 320 }}
        >
          <TextField
            size="small"
            placeholder="Search brand or text..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8 }} />,
            }}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 260, flex: 1 }}>
            <InputLabel id="brand-multi">Brands</InputLabel>
            <Select
              labelId="brand-multi"
              label="Brands"
              multiple
              value={selectedBrands}
              onChange={(e) => setSelectedBrands(e.target.value)}
              renderValue={(sel) => (sel || []).join(", ")}
            >
              {allBrands.map((b) => (
                <MenuItem key={b} value={b}>
                  <Checkbox checked={selectedBrands.includes(b)} />
                  <ListItemText primary={b} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowSimilarity((s) => !s)}
          >
            {showSimilarity ? "Hide" : "Show"} Similarity
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download size={16} />}
            onClick={exportAll}
          >
            Export CSV
          </Button>
          <Button variant="contained" color="secondary" onClick={exportPDF}>
            Export PDF
          </Button>
        </Stack>
      </Box>

      {/* Magna Insights Panel (collapsible) */}
      {(magnaMission ||
        magnaVision ||
        magnaPurpose ||
        magnaValues ||
        magnaThemes ||
        magnaPromise ||
        magnaTagline) && (
        <Card
          sx={{ border: `1px solid ${colors.magna}`, background: "#2a2223" }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                sx={{ color: colors.magna, fontWeight: 600 }}
              >
                Magna-Specific Insights (from this dataset)
              </Typography>
              <Button
                size="small"
                onClick={() => setShowMagnaPanel((s) => !s)}
                sx={{ color: colors.magna }}
              >
                {showMagnaPanel ? "Collapse" : "Expand"}
              </Button>
            </Stack>
            <Collapse in={showMagnaPanel}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {magnaMission && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Mission
                    </Typography>
                    <Typography variant="body2">
                      {magnaMission.mission}
                    </Typography>
                  </Grid>
                )}
                {magnaVision && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Vision
                    </Typography>
                    <Typography variant="body2">
                      {magnaVision.vision}
                    </Typography>
                  </Grid>
                )}
                {magnaPurpose && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Purpose
                    </Typography>
                    <Typography variant="body2">
                      {magnaPurpose.purpose}
                    </Typography>
                  </Grid>
                )}
                {magnaValues && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Values
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(magnaValues.values || []).map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          size="small"
                          sx={{ borderColor: colors.magna, color: colors.text }}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Grid>
                )}
                {magnaThemes && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Themes
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(magnaThemes.themes || []).map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          sx={{ borderColor: colors.magna, color: colors.text }}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Grid>
                )}
                {magnaPromise && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Brand Promise
                    </Typography>
                    <Typography variant="body2">
                      {magnaPromise.promise}
                    </Typography>
                  </Grid>
                )}
                {magnaTagline && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.silver }}
                    >
                      Tagline
                    </Typography>
                    <Typography variant="body2">
                      “{magnaTagline.tagline}”
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Mission Comparison Matrix */}
      <Card>
        <CardContent>
          <SectionTitle>Mission Comparison Matrix</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>Mission</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mission.map((m) => (
                <TableRow
                  key={m.brandName}
                  sx={{
                    backgroundColor: m.color
                      ? `${colors.charcoal}55`
                      : "transparent",
                    transition: "background-color 200ms ease",
                    "&:hover": { backgroundColor: "#2b2e34" },
                    outline: m.color ? `1px solid ${colors.magna}55` : "none",
                  }}
                >
                  <TableCell
                    sx={{ color: m.color || colors.text, whiteSpace: "nowrap" }}
                  >
                    {m.brandName}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 680 }}>
                    <Tooltip title={m.mission} placement="top-start">
                      <span style={{ display: "inline-block" }}>
                        {showSimilarity
                          ? highlightCommon(m.mission)
                          : m.mission}
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Optional Similarity Heatmap */}
          {showSimilarity && missionSimilarity.brands.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.silver, mb: 1 }}
              >
                Mission Text Similarity (Jaccard)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    {missionSimilarity.brands.map((b) => (
                      <TableCell key={`h-${b}`}>{b}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missionSimilarity.rows.map((row, i) => (
                    <TableRow key={`r-${i}`}>
                      <TableCell>{missionSimilarity.brands[i]}</TableCell>
                      {row.map((v, j) => {
                        const hue = Math.round(v * 120); // 0-red to 120-green
                        return (
                          <TableCell
                            key={`c-${i}-${j}`}
                            sx={{
                              background: `hsl(${hue}, 50%, ${30 + v * 20}%)`,
                            }}
                          >
                            {v.toFixed(2)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Vision Comparison Matrix */}
      <Card>
        <CardContent>
          <SectionTitle>Vision Comparison Matrix</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>Vision</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vision.map((m) => (
                <TableRow
                  key={m.brandName}
                  sx={{
                    backgroundColor: m.color
                      ? `${colors.charcoal}55`
                      : "transparent",
                    transition: "background-color 200ms ease",
                    "&:hover": { backgroundColor: "#2b2e34" },
                    outline: m.color ? `1px solid ${colors.magna}55` : "none",
                  }}
                >
                  <TableCell
                    sx={{ color: m.color || colors.text, whiteSpace: "nowrap" }}
                  >
                    {m.brandName}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 680 }}>
                    <Tooltip title={m.vision} placement="top-start">
                      <span style={{ display: "inline-block" }}>
                        {m.vision}
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purpose Comparison Matrix */}
      <Card>
        <CardContent>
          <SectionTitle>Purpose Comparison Matrix</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>Purpose</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purpose.map((m) => (
                <TableRow
                  key={m.brandName}
                  sx={{
                    backgroundColor: m.color
                      ? `${colors.charcoal}55`
                      : "transparent",
                    transition: "background-color 200ms ease",
                    "&:hover": { backgroundColor: "#2b2e34" },
                    outline: m.color ? `1px solid ${colors.magna}55` : "none",
                  }}
                >
                  <TableCell
                    sx={{ color: m.color || colors.text, whiteSpace: "nowrap" }}
                  >
                    {m.brandName}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 680 }}>
                    <Tooltip title={m.purpose} placement="top-start">
                      <span style={{ display: "inline-block" }}>
                        {m.purpose}
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Values Explorer + Chart */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Values Explorer</SectionTitle>
              <Stack spacing={1}>
                {values.map((v) => (
                  <Stack
                    key={v.brandName}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Chip
                      label={v.brandName}
                      size="small"
                      sx={{
                        bgcolor: v.color ? `${colors.magna}22` : "transparent",
                        color: v.color || colors.text,
                        border: v.color
                          ? `1px solid ${colors.magna}`
                          : "1px solid #444",
                      }}
                    />
                    {(v.values || []).map((val) => (
                      <Chip
                        key={val}
                        label={val}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: "#555", color: colors.silver }}
                      />
                    ))}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Values Count by Brand (Recharts)</SectionTitle>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={valuesBar}>
                    <CartesianGrid stroke="#333" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" name="Values Count" fill={colors.blue}>
                      {valuesBar.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.color || colors.blue}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Positioning Statement Cards (expandable) */}
      <Card>
        <CardContent>
          <SectionTitle>Positioning Statement Cards</SectionTitle>
          <Grid container spacing={2}>
            {positions.map((p) => {
              const key = `${p.brandName}-positioning`;
              const expanded = !!expandedCards[key];
              const text = p.positioningStatement || "";
              const preview =
                text.length > 220 ? `${text.slice(0, 220)}…` : text;
              return (
                <Grid item xs={12} md={6} key={p.brandName}>
                  <Card
                    sx={{
                      height: "100%",
                      border: p.color
                        ? `1px solid ${colors.magna}`
                        : "1px solid #333",
                      transition: "transform 200ms ease",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: p.color || colors.text }}
                      >
                        {p.brandName}
                      </Typography>
                      <Typography variant="body2">
                        {expanded ? text : preview}
                      </Typography>
                      {text.length > 220 && (
                        <Button
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => toggleExpand(key)}
                        >
                          {expanded ? "Show less" : "Show more"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Themes, Brand Promise, Taglines (taglines expandable) */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Key Themes Visualization</SectionTitle>
              <Stack spacing={1}>
                {themes.map((t) => (
                  <Stack
                    key={t.brandName}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Chip
                      label={t.brandName}
                      size="small"
                      sx={{
                        bgcolor: t.color ? `${colors.magna}22` : "transparent",
                        color: t.color || colors.text,
                        border: t.color
                          ? `1px solid ${colors.magna}`
                          : "1px solid #444",
                      }}
                    />
                    {(t.themes || []).map((th) => (
                      <Chip
                        key={th}
                        label={th}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: "#555", color: colors.silver }}
                      />
                    ))}
                  </Stack>
                ))}
              </Stack>

              {/* Aggregate Theme Frequency */}
              {themeFrequency.length > 0 && (
                <Box sx={{ mt: 2, height: 260 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: colors.silver, mb: 1 }}
                  >
                    Theme Frequency Across Selected Brands
                  </Typography>
                  <ResponsiveContainer>
                    <BarChart data={themeFrequency}>
                      <CartesianGrid stroke="#333" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill={colors.green} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Brand Promise & Taglines</SectionTitle>
              <Stack spacing={1}>
                {promises.map((pr) => (
                  <Stack
                    key={pr.brandName}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip
                      label={pr.brandName}
                      size="small"
                      sx={{
                        bgcolor: pr.color ? `${colors.magna}22` : "transparent",
                        color: pr.color || colors.text,
                        border: pr.color
                          ? `1px solid ${colors.magna}`
                          : "1px solid #444",
                      }}
                    />
                    <Typography variant="body2">{pr.promise}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={1}>
                {taglines.map((tg) => {
                  const key = `${tg.brandName}-tagline`;
                  const expanded = !!expandedCards[key];
                  const text = `“${tg.tagline}”`;
                  const preview =
                    text.length > 120 ? `${text.slice(0, 120)}…` : text;
                  return (
                    <Grid item xs={12} key={tg.brandName}>
                      <Card
                        sx={{
                          border: tg.color
                            ? `1px solid ${colors.magna}`
                            : "1px solid #333",
                          background: "#1f2126",
                        }}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: tg.color || colors.text }}
                          >
                            {tg.brandName}
                          </Typography>
                          <Typography variant="body2">
                            {expanded ? text : preview}
                          </Typography>
                          {text.length > 120 && (
                            <Button
                              size="small"
                              sx={{ mt: 0.5 }}
                              onClick={() => toggleExpand(key)}
                            >
                              {expanded ? "Show less" : "Show more"}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

/* ===========================
   PAGE 2: Verbal & Narrative Intelligence
   Data: data/prompt2.json
   =========================== */
function Page2() {
  const brands = (p2?.brandReports || []).map((b) => b.brandName);
  const [brand, setBrand] = useState(brands[0] || "");

  const current = useMemo(
    () => (p2?.brandReports || []).find((b) => b.brandName === brand) || {},
    [brand]
  );

  const tonalRadarData = useMemo(() => {
    const entries = Object.entries(current?.tonalRangeHeatMap || {}).filter(
      ([, v]) => typeof v.frequency === "number"
    );
    return entries.map(([k, v]) => ({ tone: k, freq: v.frequency }));
  }, [current]);

  const rhetoricalPie = useMemo(() => {
    const r = current?.rhetoricalStyleTriangleCharts || {};
    return [
      { name: "Ethos", value: pctToNumber(r.ethos) },
      { name: "Logos", value: pctToNumber(r.logos) },
      { name: "Pathos", value: pctToNumber(r.pathos) },
    ];
  }, [current]);

  const lexiconTreemap = useMemo(() => {
    const obj = current?.lexiconExplorer || {};
    const children = Object.entries(obj).map(([key, v]) => ({
      name: v.category || key,
      size: (v.uniqueWords || []).length,
    }));
    return [{ name: "Lexicon", children }];
  }, [current]);

  const pieColors = [colors.blue, colors.green, colors.orange];

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  // Customized Treemap content to always render labels, scaling font to fit
  const TreemapContent = (props) => {
    const { depth, x, y, width, height, name } = props;
    const fill = depth === 1 ? colors.green : "#9AE34D";
    const w = Math.max(0, width || 0);
    const h = Math.max(0, height || 0);

    // Keep labels readable but not oversized
    const fontSize = Math.max(10, Math.min(16, Math.min(w, h) / 10));

    // Basic word-wrapping for SVG <text> using tspans (approximate by char count)
    const wrapWords = (text, maxPerLine, maxLines = 3) => {
      const words = String(text || "")
        .split(/\s+/)
        .filter(Boolean);
      const lines = [];
      let line = "";
      for (const word of words) {
        const next = line ? line + " " + word : word;
        if (next.length <= maxPerLine) {
          line = next;
        } else {
          if (line) lines.push(line);
          line = word;
        }
        if (lines.length >= maxLines) break;
      }
      if (line && lines.length < maxLines) lines.push(line);
      // If still overflowing, ellipsize the last line
      if (lines.length === maxLines) {
        const last = lines[maxLines - 1];
        if (last.length > maxPerLine) {
          lines[maxLines - 1] =
            last.slice(0, Math.max(0, maxPerLine - 1)) + "…";
        }
      }
      return lines;
    };

    // Approximate max characters per line based on width and font size (~0.6em per char)
    const maxCharsPerLine = Math.max(
      6,
      Math.floor((w || 0) / (fontSize * 0.6))
    );
    const shouldRenderText = w >= 60 && h >= 36;
    const lines = shouldRenderText ? wrapWords(name, maxCharsPerLine, 3) : [];

    // Center multi-line block vertically
    const totalHeight = lines.length * fontSize * 1.1;
    const startY = y + h / 2 - totalHeight / 2 + fontSize * 0.85;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          style={{ fill, stroke: "#333" }}
        />
        {shouldRenderText ? (
          <text
            x={x + w / 2}
            textAnchor="middle"
            fill="#000"
            style={{ pointerEvents: "none", fontWeight: 700 }}
            fontSize={fontSize}
          >
            {lines.map((ln, i) => (
              <tspan key={i} x={x + w / 2} y={startY + i * fontSize * 1.1}>
                {ln}
              </tspan>
            ))}
          </text>
        ) : null}
      </g>
    );
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="brand2">Brand</InputLabel>
          <Select
            labelId="brand2"
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            {brands.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Chip
          label="Magna highlighted in RED"
          size="small"
          sx={{
            bgcolor: `${colors.magna}22`,
            color: colors.magna,
            border: `1px solid ${colors.magna}`,
          }}
        />
      </Stack>

      <Grid container spacing={2}>
        {/* Voice Personality Cards */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <SectionTitle>Voice Personality Cards</SectionTitle>
              <Stack spacing={1}>
                {Object.entries(current?.voicePersonalityCards || {}).map(
                  ([title, obj]) => (
                    <Box key={title}>
                      <Typography variant="subtitle2">{title}</Typography>
                      <Typography variant="body2">{obj.description}</Typography>
                    </Box>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Tonal Range Radar */}
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <SectionTitle>Tonal Range Radar</SectionTitle>
              <Box sx={{ height: 320, width: "60vw" }}>
                <ResponsiveContainer>
                  <RChart data={tonalRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="tone" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Frequency"
                      dataKey="freq"
                      stroke={colors.blue}
                      fill={colors.blue}
                      fillOpacity={0.5}
                    />
                    <Legend />
                  </RChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lexicon Explorer Treemap */}
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <SectionTitle>Lexicon Explorer</SectionTitle>
              <Box sx={{ height: 420, width: "100%" }}>
                <ResponsiveContainer>
                  <Treemap
                    data={lexiconTreemap}
                    dataKey="size"
                    nameKey="name"
                    stroke="#333"
                    fill={colors.green}
                    content={<TreemapContent />}
                    isAnimationActive={false}
                  />
                </ResponsiveContainer>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", mt: 1 }}
              >
                {(lexiconTreemap?.[0]?.children || []).map((c) => (
                  <Chip
                    key={c.name}
                    label={c.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#555",
                      color: colors.silver,
                      mr: 1,
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Rhetorical Style Pie */}
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <SectionTitle>Rhetorical Style (Ethos/Logos/Pathos)</SectionTitle>
              <Box sx={{ height: 360, width: "100%" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={rhetoricalPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="75%"
                      label
                    >
                      {rhetoricalPie.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={pieColors[idx % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Brand Narrative Reader */}
      <Card>
        <CardContent>
          <SectionTitle>Brand Narrative</SectionTitle>
          <Typography variant="body2">
            {current?.brandNarrativeReader || ""}
          </Typography>
        </CardContent>
      </Card>

      {/* Archetype Constellation + Analyzer */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Archetype Constellation</SectionTitle>
              <Typography variant="body2">
                Primary: {current?.archetypeConstellation?.primary || "-"}
              </Typography>
              <Typography variant="body2">
                Secondary: {current?.archetypeConstellation?.secondary || "-"}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.silver }}>
                {current?.archetypeConstellation?.visualizationNotes || ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Archetype Pattern Analyzer</SectionTitle>
              <Typography variant="body2">
                {
                  current?.archetypePatternAnalyzer
                    ?.industryArchetypeDistribution
                }
              </Typography>
              <Typography variant="body2">
                Unused:{" "}
                {(
                  current?.archetypePatternAnalyzer?.unusedArchetypes || []
                ).join(", ")}
              </Typography>
              <Typography variant="body2">
                {current?.archetypePatternAnalyzer?.creatorAdvantage}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.silver }}>
                {current?.archetypePatternAnalyzer?.primaryVsSecondaryPatterns}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Narrative Structure Comparator */}
      <Card>
        <CardContent>
          <SectionTitle>Narrative Structure Comparator</SectionTitle>
          <Typography variant="body2">
            Story Arc: {current?.narrativeStructureComparator?.storyArcAnalysis}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {Object.entries(
              current?.narrativeStructureComparator
                ?.commonNarrativeThemesHeatMap || {}
            ).map(([k, v]) => (
              <Chip
                key={k}
                label={`${k}: ${v}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#555", color: colors.silver, mr: 1, mb: 1 }}
              />
            ))}
          </Stack>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {(
              current?.narrativeStructureComparator
                ?.uniqueNarrativeElementsIdentifier || []
            ).map((t, idx) => (
              <Typography key={idx} variant="body2">
                - {t}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Coherence Scorer */}
      <Card>
        <CardContent>
          <SectionTitle>Archetype-Narrative Coherence Scorer</SectionTitle>
          <Typography variant="body2">
            Alignment:{" "}
            {current?.archetypeNarrativeCoherenceScorer?.alignmentAssessment}
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {(
              current?.archetypeNarrativeCoherenceScorer
                ?.contradictionIdentifier || []
            ).map((t, idx) => (
              <Typography key={idx} variant="body2">
                - {t}
              </Typography>
            ))}
          </Stack>
          <Typography
            variant="caption"
            sx={{ color: colors.silver, mt: 1, display: "block" }}
          >
            {
              current?.archetypeNarrativeCoherenceScorer
                ?.strategicImplicationsOfMisalignment
            }
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   PAGE 3: Strategic Analysis & Tensions
   Data: data/prompt3.json
   =========================== */
function Page3() {
  const brands = (p3?.brandReports || []).map((b) => b.brandName);
  const [brand, setBrand] = useState(brands[0] || "");

  const current = useMemo(
    () => (p3?.brandReports || []).find((b) => b.brandName === brand) || {},
    [brand]
  );

  const tensionPattern = useMemo(() => {
    const arr =
      p3?.enhancedAnalyticalComponents?.competitiveTensionAnalyzer
        ?.tensionPatternMatrix || [];
    return arr.map((t) => ({
      name: t.name,
      percentage: pctToNumber(t.percentage),
    }));
  }, []);

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="brand3">Brand</InputLabel>
          <Select
            labelId="brand3"
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            {brands.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Chip
          label="Magna in RED"
          size="small"
          sx={{
            bgcolor: `${colors.magna}22`,
            color: colors.magna,
            border: `1px solid ${colors.magna}`,
          }}
        />
      </Stack>

      {/* Narrative Coherence Scorecard */}
      <Card>
        <CardContent>
          <SectionTitle>Narrative Coherence Scorecard</SectionTitle>
          <Typography variant="body2">
            Alignment: {current?.narrativeCoherenceScorecard?.alignmentScore}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tension</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(current?.narrativeCoherenceScorecard?.tensions || []).map(
                (t) => (
                  <TableRow key={t.name}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.severity}
                        size="small"
                        color={
                          t.severity === "High"
                            ? "error"
                            : t.severity === "Medium"
                            ? "secondary"
                            : "default"
                        }
                        sx={{ border: "1px solid #444" }}
                      />
                    </TableCell>
                    <TableCell>{t.description}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audience Personas */}
      <Card>
        <CardContent>
          <SectionTitle>Audience Persona Network</SectionTitle>
          <Grid container spacing={2}>
            {Object.values(current?.audiencePersonaNetwork || {}).map((p) => (
              <Grid item xs={12} md={4} key={p.name}>
                <Card sx={{ border: "1px solid #333" }}>
                  <CardContent>
                    <Typography variant="subtitle2">{p.name}</Typography>
                    <Typography variant="body2">{p.description}</Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      {(p.focus || []).map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#555",
                            color: colors.silver,
                            mr: 1,
                            mb: 1,
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Portfolio & Brand Architecture */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Portfolio Architecture Comparison</SectionTitle>
              <Typography variant="body2">
                {current?.portfolioArchitectureComparison?.architectureType}:{" "}
                {current?.portfolioArchitectureComparison?.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle>Brand Architecture Analysis</SectionTitle>
              <Typography variant="body2">
                Master Brand: {current?.brandArchitectureAnalysis?.masterBrand}
              </Typography>
              <Typography variant="body2">
                Sub-brands: {current?.brandArchitectureAnalysis?.subBrands}
              </Typography>
              <Typography variant="body2">
                Relationship:{" "}
                {current?.brandArchitectureAnalysis?.brandRelationship}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tension Pattern Matrix (BarChart) */}
      <Card>
        <CardContent>
          <SectionTitle>Competitive Tension Pattern Matrix</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={tensionPattern}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="percentage" name="%" fill={colors.orange} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Key Business Drivers Priority Matrix (table) */}
      <Card>
        <CardContent>
          <SectionTitle>Key Business Drivers Priority Matrix</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Evidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(current?.keyBusinessDriversPriorityMatrix || []).map((d) => (
                <TableRow key={d.driver}>
                  <TableCell>{d.driver}</TableCell>
                  <TableCell>{d.priority}</TableCell>
                  <TableCell>{d.evidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   PAGE 4: Quantitative Metrics Command Center
   Data: data/prompt4.json (brandMetrics, chartData, enhancedAnalyticalLayers)
   =========================== */
function Page4() {
  const cd = p4?.chartData || {};
  const enhanced = p4?.enhancedAnalyticalLayers || {};

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  const sentimentRadial = cd?.radialbarchart_sentiment_scores || [];
  const sentimentBarsData = useMemo(
    () =>
      [...(sentimentRadial || [])]
        .map((s) => ({ brand: s.brand, score: s.score, color: s.color }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [sentimentRadial]
  );
  const confidenceBars = cd?.barchart_confidence_ratios || [];
  const pagesWords = cd?.barchart_pages_words_analyzed || [];
  const activeVoice = cd?.linechart_active_voice_percentage || [];
  const futureArea = cd?.areachart_future_statements || [];
  const valueladen = cd?.treemap_value_laden_frequencies || [];
  const nameMentions = cd?.barchart_brand_name_mentions || [];
  const directAddress = cd?.composedchart_direct_address_counts || [];
  const radarEmotion = cd?.radarchart_emotion_scores || [];
  const psCounts = cd?.barchart_problem_solution_counts || [];

  const treemapData = [
    {
      name: "Values",
      children: (valueladen || []).map((v) => ({
        name: v.brand,
        size: v.count,
      })),
    },
  ];

  // Prepare Magna emotion radar data
  const magnaEmotion =
    radarEmotion.find((b) => b.brand === "MAGNA INTERNATIONAL") || {};
  const magnaEmotionData = [
    "trust",
    "joy",
    "anticipation",
    "surprise",
    "fear",
  ].map((k) => ({
    metric: k,
    value: typeof magnaEmotion[k] === "number" ? magnaEmotion[k] : 0,
  }));

  return (
    <Stack spacing={3}>
      {/* Insight Panels */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Alert
            icon={<AlertTriangle />}
            severity="warning"
            sx={{
              bgcolor: "#3a2a2a",
              color: colors.text,
              border: `1px solid ${colors.orange}`,
            }}
          >
            Ratio Strategic Analyzer: Magna confidence ratio{" "}
            {enhanced?.ratioStrategicAnalyzer?.confidenceRatioImplications?.find(
              (x) => (x.brandName || "").toLowerCase().includes("magna")
            )?.ratio ?? ""}{" "}
            is LOW vs. average{" "}
            {
              enhanced?.ratioStrategicAnalyzer?.industryBenchmarksOverlay
                ?.averageRatio
            }
            . Critical improvement needed.
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert
            severity="info"
            sx={{
              bgcolor: "#22322a",
              color: colors.text,
              border: `1px solid ${colors.green}`,
            }}
          >
            Engagement: Magna direct address{" "}
            {directAddress.find((d) => d.brand === "MAGNA INTERNATIONAL")
              ?.count ?? 0}
            . Target 400+ per insights.
          </Alert>
        </Grid>
      </Grid>

      {/* Pages & Words */}
      <Card>
        <CardContent>
          <SectionTitle>Pages & Words Analyzed</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <ComposedChart data={pagesWords}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="pages" fill={colors.blue} />
                <Line dataKey="words" stroke={colors.green} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Confidence Ratios */}
      <Card>
        <CardContent>
          <SectionTitle>Confidence Ratios</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={confidenceBars}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="ratio" fill={colors.blue}>
                  {confidenceBars.map((b, idx) => (
                    <Cell key={idx} fill={b.color || colors.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Active Voice */}
      <Card>
        <CardContent>
          <SectionTitle>Active Voice %</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={activeVoice}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke={colors.green}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Problem vs Solution */}
      <Card>
        <CardContent>
          <SectionTitle>Problem vs Solution Counts</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <ComposedChart data={psCounts}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="problem" fill={colors.orange} />
                <Bar dataKey="solution" fill={colors.blue} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Future Statements */}
      <Card>
        <CardContent>
          <SectionTitle>Future Statements</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={futureArea}>
                <defs>
                  <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={colors.blue}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.blue}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.blue}
                  fillOpacity={1}
                  fill="url(#areaA)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Emotion Radar (MAGNA) */}
      <Card>
        <CardContent>
          <SectionTitle>
            Emotion Scores (Radar) — MAGNA INTERNATIONAL
          </SectionTitle>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <RChart data={magnaEmotionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar
                  name="MAGNA INTERNATIONAL"
                  dataKey="value"
                  stroke={colors.magna}
                  fill={colors.magna}
                  fillOpacity={0.45}
                />
                <Legend />
              </RChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Sentiment Radial */}
      <Card>
        <CardContent>
          <SectionTitle>Sentiment Scores</SectionTitle>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={sentimentBarsData}>
                <CartesianGrid stroke="#333" />
                <XAxis
                  dataKey="brand"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" name="Score" fill={colors.blue}>
                  {sentimentBarsData.map((d, i) => (
                    <Cell key={i} fill={d.color || colors.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Value-laden Treemap */}
      <Card>
        <CardContent>
          <SectionTitle>Value-laden Frequencies (Treemap)</SectionTitle>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                stroke="#333"
                fill={colors.green}
                content={<ValueTreemapContent />}
                isAnimationActive={false}
              />
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Brand Name Mentions + Direct Address */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <SectionTitle>Brand Name Mentions</SectionTitle>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={nameMentions}>
                    <CartesianGrid stroke="#333" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill={colors.blue}>
                      {nameMentions.map((b, idx) => (
                        <Cell key={idx} fill={b.color || colors.blue} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <SectionTitle>Direct Address Counts</SectionTitle>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <ComposedChart data={directAddress}>
                    <CartesianGrid stroke="#333" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" fill={colors.green} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

/* ===========================
   PAGE 5: Business Driver Competition Analyzer
   Data: data/prompt5.json
   =========================== */
function Page5() {
  const brands = (p5?.brandDriverAnalysis || []).map((b) => b.brandName);
  const [brand, setBrand] = useState(
    brands.find((b) => b === "MAGNA INTERNATIONAL") || brands[0] || ""
  );

  const radarDrivers = p5?.rechartsVisualizations?.radarChartDrivers || [];
  const barRankings = p5?.rechartsVisualizations?.barchartRankings || [];
  const sdvCrisis = p5?.criticalNewComponents?.sdvCrisisDashboard;

  const selectedDriverDetail = useMemo(() => {
    return (
      (p5?.brandDriverAnalysis || []).find((b) => b.brandName === brand)
        ?.drivers || {}
    );
  }, [brand]);

  const radarDataFor = useMemo(
    () => radarDrivers.find((r) => r.brand === brand),
    [radarDrivers, brand]
  );

  const radarData = useMemo(() => {
    if (!radarDataFor) return [];
    return [
      { key: "Electrification", val: radarDataFor.electrification },
      { key: "ADAS", val: radarDataFor.adas },
      { key: "SDV", val: radarDataFor.sdv },
      { key: "Connectivity", val: radarDataFor.connectivity },
      { key: "Sustainability", val: radarDataFor.sustainability },
      {
        key: "Digital Transformation",
        val: radarDataFor.digitalTransformation,
      },
    ];
  }, [radarDataFor]);

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  return (
    <Stack spacing={3}>
      {/* SDV Crisis Panel */}
      {sdvCrisis ? (
        <Alert
          icon={<AlertTriangle />}
          severity="error"
          sx={{
            bgcolor: "#3a2a2a",
            color: colors.text,
            border: `1px solid ${colors.orange}`,
          }}
        >
          SDV Crisis Dashboard: {sdvCrisis.alert} | Magna Rank:{" "}
          {sdvCrisis.magnaSdvRanking}, Sentiment: {sdvCrisis.magnaSdvSentiment}{" "}
          | Benchmark {sdvCrisis.benchmarkBrand}:{" "}
          {sdvCrisis.benchmarkSdvSentiment}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="brand5">Brand</InputLabel>
          <Select
            labelId="brand5"
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            {brands.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Chip
          label="Magna specific indicators in RED"
          size="small"
          sx={{
            bgcolor: `${colors.magna}22`,
            color: colors.magna,
            border: `1px solid ${colors.magna}`,
          }}
        />
      </Stack>

      {/* Driver Sentiments Radar */}
      <Card>
        <CardContent>
          <SectionTitle>Driver Sentiments (Radar)</SectionTitle>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <RChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="key" />
                <PolarRadiusAxis />
                <Radar
                  name={brand}
                  dataKey="val"
                  stroke={
                    brand === "MAGNA INTERNATIONAL" ? colors.magna : colors.blue
                  }
                  fill={
                    brand === "MAGNA INTERNATIONAL" ? colors.magna : colors.blue
                  }
                  fillOpacity={0.4}
                />
                <RechartsTooltip />
                <Legend />
              </RChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Rankings BarChart */}
      <Card>
        <CardContent>
          <SectionTitle>Driver Rankings (Lower is Better)</SectionTitle>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer>
              <ComposedChart data={barRankings}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="brand" />
                <YAxis reversed />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="electrification" fill={colors.green} />
                <Bar dataKey="adas" fill={colors.blue} />
                <Bar dataKey="sdv" fill={colors.orange} />
                <Bar dataKey="connectivity" fill="#9b59b6" />
                <Bar dataKey="sustainability" fill="#f1c40f" />
                <Bar dataKey="digitalTransformation" fill="#1abc9c" />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Driver details table for selected brand */}
      <Card>
        <CardContent>
          <SectionTitle>Driver Details</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>Instances</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell>Evidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(selectedDriverDetail).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell sx={{ color: v.color || colors.text }}>
                    {v.rank}
                  </TableCell>
                  <TableCell>{v.instanceCount}</TableCell>
                  <TableCell>{v.sentimentScore}</TableCell>
                  <TableCell>{v.evidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   PAGE 6: Strategic Whitespace & Opportunity
   Data: data/prompt6.json
   =========================== */
function Page6() {
  const ws = p6?.whitespaceAnalysis?.identifiedGaps || {};
  const territories =
    p6?.enhancedComponents?.uniqueTerritoryMapper?.territories || [];
  const creator = p6?.enhancedComponents?.creatorAdvantageExploiter || {};
  const audience =
    p6?.enhancedComponents?.comprehensiveAudienceIntelligenceSystem || {};
  const priorities =
    p6?.enhancedComponents?.competitiveWhitespacePriorities?.ranking || [];

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <SectionTitle>Identified Gaps</SectionTitle>
          {Object.entries(ws).map(([k, v]) => (
            <Box key={k} sx={{ mb: 1 }}>
              <Typography variant="subtitle2">{k}</Typography>
              <Typography variant="body2">{v}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {territories.map((t) => (
          <Grid item xs={12} md={4} key={t.name}>
            <Card sx={{ border: `1px solid ${t.color || "#333"}` }}>
              <CardContent>
                <SectionTitle>{t.name}</SectionTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t.description}
                </Typography>
                <Chip
                  label={`Defensibility: ${t.defensibilityScore}`}
                  size="small"
                  sx={{
                    bgcolor: `${colors.green}22`,
                    color: colors.green,
                    border: `1px solid ${colors.green}`,
                    mb: 1,
                  }}
                />
                <Stack spacing={0.5}>
                  {(t.implementationRoadmap || []).map((step, i) => (
                    <Typography key={i} variant="body2">
                      {step}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <SectionTitle>Creator Advantage Exploiter</SectionTitle>
          <Typography variant="body2">
            {creator.creatorArchetypeUtilization}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Anti-Sage Positioning Strategies
          </Typography>
          <Stack spacing={0.5}>
            {(creator.antiSagePositioningStrategies || []).map((x, i) => (
              <Typography key={i} variant="body2">
                {x}
              </Typography>
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Creator-specific Market Tactics
          </Typography>
          <Stack spacing={0.5}>
            {(creator.creatorSpecificMarketTactics || []).map((x, i) => (
              <Typography key={i} variant="body2">
                {x}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Audience Intelligence</SectionTitle>
          <Typography variant="subtitle2">Exclusive Audiences</Typography>
          <Stack spacing={0.5}>
            {(audience.audienceOwnershipMatrix?.exclusiveAudiences || []).map(
              (x, i) => (
                <Typography key={i} variant="body2">
                  {x.brand}: {x.audience}
                </Typography>
              )
            )}
          </Stack>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Magna Opportunity:{" "}
            {audience.audienceOwnershipMatrix?.magnaUniqueAudienceOpportunity}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Audience Saturation Heat Map
          </Typography>
          {Object.entries(audience.audienceSaturationHeatMap || {}).map(
            ([k, v]) => (
              <Typography key={k} variant="body2">
                {v.audience}: {v.notes}
              </Typography>
            )
          )}
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Emerging Audiences
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
            {(audience.emergingAudienceFinder?.noOneTargets || []).map((x) => (
              <Chip
                key={x}
                label={x}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#555", color: colors.silver, mr: 1, mb: 1 }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Competitive Whitespace Priorities</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Opportunity</TableCell>
                <TableCell>Ability to Win</TableCell>
                <TableCell>Market Size</TableCell>
                <TableCell>Defensibility</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priorities.map((p) => (
                <TableRow key={p.opportunity}>
                  <TableCell>{p.opportunity}</TableCell>
                  <TableCell>{p.magnaAbilityToWin}</TableCell>
                  <TableCell>{p.marketSizeImportance}</TableCell>
                  <TableCell>{p.competitiveDefensibility}</TableCell>
                  <TableCell>{p.implementationDifficulty}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.priority}
                      size="small"
                      sx={{
                        bgcolor:
                          p.color === colors.green
                            ? `${colors.green}22`
                            : "#332",
                        color: p.color === "YELLOW" ? "#ffeb3b" : colors.green,
                        border: "1px solid #444",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   PAGE 7: Strategic Recommendations Dashboard
   Data: data/prompt7.json
   =========================== */
function Page7() {
  const rec = p7?.recommendationModules || {};
  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <SectionTitle>Competitive-based Positioning Optimizer</SectionTitle>
          <Stack spacing={1}>
            {(
              rec.competitiveBasedPositioningOptimizer?.recommendations || []
            ).map((r) => (
              <Box key={r.title}>
                <Typography variant="subtitle2">{r.title}</Typography>
                <Typography variant="body2">Evidence: {r.evidence}</Typography>
                <Typography variant="body2">Tactics: {r.tactics}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>
            Narrative Enhancer with Competitive Context
          </SectionTitle>
          <Typography variant="subtitle2">Confidence Ratio</Typography>
          <Typography variant="body2">
            Magna:{" "}
            {
              rec.narrativeEnhancerWithCompetitiveContext
                ?.magnaConfidenceRatioAnalysis?.magnaRatio
            }{" "}
            | Industry Range:{" "}
            {
              rec.narrativeEnhancerWithCompetitiveContext
                ?.magnaConfidenceRatioAnalysis?.industryRange
            }
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {
              rec.narrativeEnhancerWithCompetitiveContext
                ?.magnaConfidenceRatioAnalysis?.recommendation
            }
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Coherence Resolution</Typography>
          <Typography variant="body2">
            {
              rec.narrativeEnhancerWithCompetitiveContext?.coherenceResolution
                ?.magnaRecommendation
            }
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Tonal Calibrator Based on Gaps</SectionTitle>
          <Stack spacing={0.5}>
            {(rec.tonalCalibratorBasedOnGaps?.tonalOpportunities || []).map(
              (t, i) => (
                <Typography key={i} variant="body2">
                  {t.brand}: {t.metric} — {t.insight}
                </Typography>
              )
            )}
          </Stack>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Optimal Mix: {rec.tonalCalibratorBasedOnGaps?.optimalTonalMix}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>
            Driver Prioritizer with Competitive Benchmarks
          </SectionTitle>
          <Stack spacing={1}>
            {(
              rec.driverPrioritizerWithCompetitiveBenchmarks?.priorities || []
            ).map((p, i) => (
              <Box key={i}>
                <Chip
                  label={p.priority}
                  size="small"
                  sx={{ mr: 1, border: "1px solid #444" }}
                />
                <Typography variant="subtitle2" component="span">
                  {p.driver} — {p.status}
                </Typography>
                <Typography variant="body2">{p.reasoning}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Audience Expansion Strategy</SectionTitle>
          <Stack spacing={1}>
            {(rec.audienceExpansionStrategy?.recommendations || []).map(
              (a, i) => (
                <Box key={i}>
                  <Typography variant="subtitle2">{a.title}</Typography>
                  <Typography variant="body2">Status: {a.status}</Typography>
                  <Typography variant="body2">Action: {a.action}</Typography>
                </Box>
              )
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Specific Competitive Actions</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Situation</TableCell>
                <TableCell>Magna Gap</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Evidence</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Timeline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rec.specificCompetitiveActions || []).map((s, i) => (
                <TableRow key={i}>
                  <TableCell>{s.situation}</TableCell>
                  <TableCell>{s.magnaGap}</TableCell>
                  <TableCell>{s.action}</TableCell>
                  <TableCell>{s.evidence}</TableCell>
                  <TableCell>{s.priority}</TableCell>
                  <TableCell>{s.timeline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle>Integration Leadership Claim</SectionTitle>
          <Typography variant="body2">
            {
              p7?.recommendationModules?.integrationLeadershipClaim
                ?.unclaimedSpace
            }
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Magna Proof Points
          </Typography>
          <Stack spacing={0.5}>
            {(
              p7?.recommendationModules?.integrationLeadershipClaim
                ?.magnaProofPoints || []
            ).map((x, i) => (
              <Typography key={i} variant="body2">
                - {x}
              </Typography>
            ))}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Messaging Strategy
          </Typography>
          <Stack spacing={0.5}>
            {(
              p7?.recommendationModules?.integrationLeadershipClaim
                ?.messagingStrategy || []
            ).map((x, i) => (
              <Typography key={i} variant="body2">
                {x}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   PAGE 8: Competitive Intelligence Navigation Hub
   Data: data/prompt8.json + cross-file metrics for comparative tool
   =========================== */
function Page8() {
  const hub = p8?.strategicHub || {};
  const [selectedBrands, setSelectedBrands] = useState([
    "MAGNA INTERNATIONAL",
    "APTIV",
    "CONTINENTAL",
  ]);

  const compBrands = hub?.comparativeAnalysisTool?.brands || [];
  const metrics = hub?.comparativeAnalysisTool?.metrics || [];

  const toggleBrand = (b) => {
    setSelectedBrands((prev) =>
      prev.includes(b)
        ? prev.filter((x) => x !== b)
        : prev.length >= 3
        ? prev
        : [...prev, b]
    );
  };

  // Metric helpers (built from prompt4 & prompt5 strictly)
  const getConfidence = (brand) =>
    (p4?.chartData?.barchart_confidence_ratios || []).find(
      (x) => x.brand === brand
    )?.ratio ?? null;
  const getActiveVoice = (brand) =>
    (p4?.chartData?.linechart_active_voice_percentage || []).find(
      (x) => x.brand === brand
    )?.percentage ?? null;
  const getDirectAddr = (brand) =>
    (p4?.chartData?.composedchart_direct_address_counts || []).find(
      (x) => x.brand === brand
    )?.count ?? null;
  const getSDVSent = (brand) => {
    const b = (p5?.brandDriverAnalysis || []).find(
      (x) => x.brandName === brand
    );
    return b?.drivers?.softwareDefinedVehicles?.sentimentScore ?? null;
  };

  const compData = selectedBrands.map((b) => ({
    brand: b,
    SDV_Sentiment: getSDVSent(b),
    Confidence_Ratio: getConfidence(b),
    Direct_Address_Count: getDirectAddr(b),
    Active_Voice_Percentage: getActiveVoice(b),
    color: b === "MAGNA INTERNATIONAL" ? colors.magna : colors.blue,
  }));

  const SectionTitle = ({ children }) => (
    <Typography variant="h6" sx={{ mb: 1, color: colors.silver }}>
      {children}
    </Typography>
  );

  return (
    <Stack spacing={3}>
      {/* Executive Strategic Summary */}
      <Card>
        <CardContent>
          <SectionTitle>Executive Strategic Summary</SectionTitle>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              Creator Advantage:{" "}
              {hub.executiveStrategicSummary?.magnaCreatorAdvantage}
            </Typography>
            <Typography variant="body2">
              SDV Crisis: {hub.executiveStrategicSummary?.sdvCrisisAlert}
            </Typography>
            <Typography variant="body2">
              Integration Opportunity:{" "}
              {hub.executiveStrategicSummary?.integrationOpportunity}
            </Typography>
            <Typography variant="body2">
              Confidence Ratio:{" "}
              {hub.executiveStrategicSummary?.confidenceRatioConcern}
            </Typography>
            <Typography variant="body2">
              Audience Gaps: {hub.executiveStrategicSummary?.audienceGaps}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Competitive Position Scorecard */}
      <Card>
        <CardContent>
          <SectionTitle>Competitive Position Scorecard</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Magna Rank</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Distance to Leader</TableCell>
                <TableCell>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(hub.competitivePositionScorecard || []).map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.metric}</TableCell>
                  <TableCell>{r.magnaRank}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      sx={{
                        bgcolor:
                          r.status === "GREEN"
                            ? `${colors.green}22`
                            : r.status === "RED"
                            ? `${colors.orange}22`
                            : "#333",
                        color:
                          r.status === "GREEN"
                            ? colors.green
                            : r.status === "RED"
                            ? colors.orange
                            : colors.silver,
                        border: "1px solid #444",
                      }}
                    />
                  </TableCell>
                  <TableCell>{r.distanceToLeader}</TableCell>
                  <TableCell>{r.trend}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      <Card>
        <CardContent>
          <SectionTitle>Top Opportunities</SectionTitle>
          <Grid container spacing={2}>
            {(hub.topOpportunitiesDashboard || []).map((o, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ border: `1px solid ${o.color || "#333"}` }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: o.color || colors.text }}
                    >
                      {o.title}
                    </Typography>
                    <Typography variant="body2">{o.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Critical Threats */}
      <Card>
        <CardContent>
          <SectionTitle>Critical Threats</SectionTitle>
          <Stack spacing={1}>
            {(hub.criticalThreatsMonitor || []).map((t, i) => (
              <Alert
                key={i}
                icon={<AlertTriangle />}
                severity="error"
                sx={{
                  bgcolor: "#3a2a2a",
                  color: colors.text,
                  border: `1px solid ${colors.orange}`,
                }}
              >
                {t.threat}: {t.description}
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Comparative Analysis Tool */}
      <Card>
        <CardContent>
          <SectionTitle>Comparative Analysis Tool</SectionTitle>
          <FormGroup row sx={{ mb: 2 }}>
            {compBrands.map((b) => (
              <FormControlLabel
                key={b}
                control={
                  <Checkbox
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                  />
                }
                label={b}
              />
            ))}
          </FormGroup>
          <Grid container spacing={2}>
            {metrics.map((m) => (
              <Grid item xs={12} md={6} key={m}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {m}
                    </Typography>
                    <Box sx={{ height: 260 }}>
                      <ResponsiveContainer>
                        <BarChart data={compData}>
                          <CartesianGrid stroke="#333" />
                          <XAxis dataKey="brand" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey={m} fill={colors.blue}>
                            {compData.map((d, i) => (
                              <Cell key={i} fill={d.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Strategic Action Priorities */}
      <Card>
        <CardContent>
          <SectionTitle>Strategic Action Priorities</SectionTitle>
          <Grid container spacing={2}>
            {Object.entries(hub.strategicActionPriorities || {}).map(
              ([k, v]) => (
                <Grid item xs={12} md={4} key={k}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">{v.title}</Typography>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {(v.actions || []).map((a, i) => (
                          <Typography key={i} variant="body2">
                            - {a}
                          </Typography>
                        ))}
                      </Stack>
                      <Chip
                        label={v.priority}
                        size="small"
                        sx={{ mt: 1, border: "1px solid #444" }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Success Metrics Dashboard */}
      <Card>
        <CardContent>
          <SectionTitle>Success Metrics Dashboard</SectionTitle>
          <Typography variant="subtitle2">Leading Indicators</Typography>
          <Stack spacing={0.5}>
            {(hub.successMetricsDashboard?.leadingIndicators || []).map(
              (x, i) => (
                <Typography key={i} variant="body2">
                  - {x}
                </Typography>
              )
            )}
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Competitive Benchmarks
          </Typography>
          <Stack spacing={0.5}>
            {(hub.successMetricsDashboard?.competitiveBenchmarks || []).map(
              (x, i) => (
                <Typography key={i} variant="body2">
                  - {x.metric}: {x.leader} ({x.score || x.count})
                </Typography>
              )
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ===========================
   APP SHELL: Sidebar + Top AppBar + Page Switcher
   =========================== */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(0);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Sidebar Header */}
      <Toolbar sx={{ color: colors.text, gap: 1 }}>
        <CircuitBoard size={18} color={colors.green} />
        <Typography variant="subtitle2">Humanbrand AI Dashboards</Typography>
      </Toolbar>
      <Divider />
      {/* Sidebar Navigation */}
      <List dense sx={{ flex: 1, overflowY: "auto" }}>
        {navItems.map((item, index) => (
          <ListItemButton
            key={item.label}
            onClick={() => {
              setPage(index);
              setMobileOpen(false);
            }}
            selected={page === index}
            sx={{
              "&.Mui-selected": { bgcolor: "#2a2d33" },
            }}
          >
            <ListItemIcon sx={{ color: colors.silver, minWidth: 32 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: "body2",
                sx: { color: colors.text },
              }}
            />
            <ChevronRight size={14} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Chip
          size="small"
          label="#222428 Dark Theme"
          sx={{
            bgcolor: colors.charcoal,
            color: colors.silver,
            border: "1px solid #444",
          }}
        />
      </Box>
    </Box>
  );

  const PageComponent = useMemo(() => {
    switch (page) {
      case 0:
        return <Page1 />;
      case 1:
        return <Page2 />;
      case 2:
        return <Page3 />;
      case 3:
        return <Page4 />;
      case 4:
        return <Page5 />;
      case 5:
        return <Page6 />;
      case 6:
        return <Page7 />;
      case 7:
        return <Page8 />;
      default:
        return <Page1 />;
    }
  }, [page]);

  const title = navItems[page]?.label || "Dashboard";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "#1a1c20" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Humanbrand AI: Magna International Outside-In Brand Perception
            (Website)
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar + Content */}
      <Box sx={{ display: "flex" }}>
        {/* Permanent drawer for sm+ */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#1a1c20",
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        {/* Temporary drawer for xs */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#1a1c20",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, ml: { sm: `${drawerWidth}px` } }}
        >
          <Toolbar />
          <Typography variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>
          {PageComponent}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

/* ===========================
   NOTES
   - All charts use Recharts.
   - Icons via lucide-react.
   - Styling via Material UI with dark theme (#222428).
   - Magna highlighted in RED (#E22E2F) where indicated by dataset.
   - Headings parsed from markdown first line after ":".
   - No fabricated data; only JSON content is rendered.
   =========================== */
