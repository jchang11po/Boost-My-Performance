import {
  Document,
  Link as PdfLink,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { TailoredResumeValues } from "@/lib/validation/resume";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.45,
    paddingHorizontal: 36,
    paddingVertical: 32,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 14,
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
  },
  title: {
    color: "#4f46e5",
    fontSize: 11,
    marginTop: 16,
  },
  contactRow: {
    color: "#4b5563",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 4,
    textTransform: "uppercase",
  },
  paragraph: {
    color: "#374151",
  },
  employmentBlock: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  company: {
    fontSize: 11,
    fontWeight: 700,
  },
  meta: {
    color: "#4b5563",
  },
  bulletList: {
    marginTop: 4,
    paddingLeft: 8,
  },
  bullet: {
    color: "#374151",
    marginBottom: 3,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillPill: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    color: "#312e81",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

type Props = {
  resume: TailoredResumeValues;
};

export function ResumePdfDocument({ resume }: Props) {
  const socialLinks = resume.socialLinks ?? [];
  const employment = resume.employment ?? [];
  const education = resume.education ?? [];
  const skills = resume.skills ?? [];

  return (
    <Document author={resume.fullName} title={`${resume.fullName} resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.fullName}</Text>
          <Text style={styles.title}>{resume.resumeTitle}</Text>
          <View style={styles.contactRow}>
            <Text>{resume.email}</Text>
            <Text>{resume.phone}</Text>
            <Text>{resume.address}</Text>
            {socialLinks.map((link) => (
              <PdfLink key={`${link.label}-${link.url}`} src={link.url} style={styles.meta}>
                {link.label}
              </PdfLink>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>{resume.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {employment.map((employmentEntry) => (
            <View key={`${employmentEntry.companyName}-${employmentEntry.period}`} style={styles.employmentBlock}>
              <View style={styles.rowBetween}>
                <Text style={styles.company}>
                  {employmentEntry.companyName}
                  {employmentEntry.location ? `, ${employmentEntry.location}` : ""}
                </Text>
                <Text style={styles.meta}>{employmentEntry.period}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text>{employmentEntry.title}</Text>
                {employmentEntry.website ? (
                  <PdfLink src={employmentEntry.website} style={styles.meta}>
                    Website
                  </PdfLink>
                ) : (
                  <Text />
                )}
              </View>
              {!!(employmentEntry.techStacks ?? []).length && (
                <Text style={styles.meta}>Tech: {(employmentEntry.techStacks ?? []).map((stack) => stack.name).join(", ")}</Text>
              )}
              <View style={styles.bulletList}>
                {(employmentEntry.workItems ?? []).map((item) => (
                  <Text key={item.content} style={styles.bullet}>
                    {"• "}
                    {item.content}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {!!education.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((education) => (
              <View key={`${education.universityName}-${education.degree}`} style={styles.employmentBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.company}>{education.universityName}</Text>
                  <Text style={styles.meta}>{education.period}</Text>
                </View>
                <Text>{education.degree}</Text>
                {education.summary ? <Text style={styles.paragraph}>{education.summary}</Text> : null}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsWrap}>
            {skills.filter((skill) => skill.name?.trim()).map((skill) => (
              <Text key={skill.name} style={styles.skillPill} wrap={false}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
