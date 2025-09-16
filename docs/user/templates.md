# Templates

Templates let instructors save a course setup once and reuse it to create new courses quickly. A template is just a special course (template = true) that provides a blueprint: phases, graphs, configurations, and (if present) the application form are copied into a new course.

---

## What gets copied?

When you create a course from a template, Prompt copies:

- Course phases and their order
- Phase/data/participation graphs
- DTO mappings and meta graphs
- Application form (if present)
- Appearance (icon and background color)
- Course type and ECTS

Dates are not copied. You choose new dates for normal courses. For templates created from an existing course, start/end dates are omitted by design.

---

## Create a new Template

You can create a new template in two ways.

### Option A: Start from scratch

1. Click the plus icon in the sidebar.
2. In the dialog, pick "Create New Template".
3. Fill in Template Properties:
   - Template Name
   - Course Type (Lecture, Seminar, Practical Course)
   - ECTS (auto-filled for Seminar/Practical Course)
   - Semester Tag (use something like "template")
4. Choose an icon and background color.
5. Confirm to create the template.

The template appears in your course list (visible to authorized users) and under "Use Template" when creating a new course.

### Option B: Make a Template from an existing Course

1. Open the course settings (Management Console > Course Settings).
2. In "Template Settings", click "Make a Template out of this Course".
3. Enter a Template Name and confirm. Prompt creates a separate template based on the current course.

Notes:

- The original course remains unchanged.
- The replica is marked as a template. Dates are set to empty (no start/end dates).

**Video Tutorial**: [Watch here!](https://live.rbg.tum.de/w/artemisintro/62137)

---

## Create a Course from a Template

1. Click the plus icon in the sidebar.
2. Choose "Use Template".
3. Select a template from the list.
4. Provide the new course details:
   - Name and Semester Tag (must be unique; hyphens are not allowed in either)
   - Start and End Date
5. Confirm. Prompt creates a new course and sets up roles/groups automatically.

Tip: If a template doesn’t show up, you might lack permission to access it. Contact a Prompt Administrator.

**Video Tutorial**: [Watch here!](https://live.rbg.tum.de/w/artemisintro/62137)

---

## Manage Template Status of a Course

- To check if a course is a template, open the course settings; the current status is shown.
- Only Prompt Admins and Course Lecturers can create templates and use them to create courses.

Validation rules (enforced by the system):

- Course Name and Semester Tag cannot contain the '-' character.
- For "Seminar" and "Practical Course", ECTS is fixed and auto-filled.

---

## FAQ

- Can students see templates? No. Templates are visible to authorized staff only.
- Can I edit a template like a normal course? Yes. You can configure phases, graphs, etc. Those settings will be used when creating new courses from the template.
- Can I convert a template back to a normal course? The status can be toggled by an admin/lecturer via the API; in the UI, new templates are usually created as separate entries.
