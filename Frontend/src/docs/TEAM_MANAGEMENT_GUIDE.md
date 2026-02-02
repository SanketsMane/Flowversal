# 👥 Team Management Guide - Flowversal

## Overview
Flowversal's Team Management system allows you to collaborate with your team by adding members, assigning roles, and managing permissions for workflow creation, task management, and more.

---

## 🚀 Quick Start

### Step 1: Access Team Management
1. Navigate to the **Dashboard** (Home page)
2. Scroll down to the **"Team Management"** section
3. Click the **"Manage Team"** button

### Step 2: View Current Team
- See all team members in a table view
- View member roles, status, and permissions
- Search for specific members using the search bar

---

## 👤 Adding Team Members

### How to Invite Members

1. **Click "Invite Member"** button (top right of Team Management modal)

2. **Enter Email Address**
   - Type the colleague's email address
   - Example: `colleague@company.com`

3. **Select Role**
   Choose from three roles:
   
   - **👑 Admin** - Full management access
     - Create, edit, delete workflows
     - Create and assign tasks
     - Manage team members
     - Full platform access
   
   - **✏️ Editor** - Create & edit workflows
     - Create and edit workflows
     - Create and assign tasks
     - Cannot delete workflows
     - Cannot manage team
   
   - **👁️ Viewer** - Read-only access
     - View workflows only
     - Cannot create or edit
     - Cannot manage tasks or team

4. **Click "Send Invite"**
   - Email invitation is sent
   - Member appears with "Invited" status
   - They can accept to become "Active"

---

## 📊 Team Member Statuses

### Status Types

- **🟢 Active** - Member has joined and is working
- **🟡 Invited** - Invitation sent, waiting for acceptance
- **⚪ Inactive** - Member has been deactivated

---

## 🔐 Role Permissions Breakdown

### Owner (You)
- **Badge Color**: Gold gradient
- **Permissions**:
  - ✅ Create Workflows
  - ✅ Edit Workflows
  - ✅ Delete Workflows
  - ✅ Create Tasks
  - ✅ Assign Tasks
  - ✅ Manage Team
  - ✅ Full platform control

### Admin
- **Badge Color**: Purple gradient
- **Permissions**:
  - ✅ Create Workflows
  - ✅ Edit Workflows
  - ✅ Delete Workflows
  - ✅ Create Tasks
  - ✅ Assign Tasks
  - ✅ Manage Team

### Editor
- **Badge Color**: Cyan gradient
- **Permissions**:
  - ✅ Create Workflows
  - ✅ Edit Workflows
  - ❌ Delete Workflows
  - ✅ Create Tasks
  - ✅ Assign Tasks
  - ❌ Manage Team

### Viewer
- **Badge Color**: Gray gradient
- **Permissions**:
  - ❌ Create Workflows
  - ❌ Edit Workflows
  - ❌ Delete Workflows
  - ❌ Create Tasks
  - ❌ Assign Tasks
  - ❌ Manage Team

---

## 🗑️ Removing Team Members

1. Find the team member in the table
2. Click the **trash icon** (🗑️) in the Actions column
3. Confirm removal in the dialog
4. Member is removed from the team

**Note**: You cannot remove the Owner (yourself)

---

## 🔍 Searching Team Members

Use the search bar at the top to find members by:
- Name
- Email address

Results update in real-time as you type.

---

## 📋 Team Member Information Display

Each team member shows:
- **Avatar** - Role-based colored circle with icon
- **Name & Email** - Full name and email address
- **Role Badge** - Visual role indicator with gradient
- **Status** - Current membership status
- **Joined Date** - When they joined the team
- **Permissions** - Quick view of what they can do
- **Actions** - Remove member option

---

## 🎯 Best Practices

### When to Use Each Role

**Use Admin for:**
- Team leaders
- Project managers
- Senior developers
- Anyone who needs full control

**Use Editor for:**
- Developers
- Content creators
- Workflow designers
- Regular team members

**Use Viewer for:**
- Stakeholders
- Clients
- Observers
- External consultants

### Security Tips

1. ✅ Only give Admin access to trusted team members
2. ✅ Start new members as Viewers, upgrade as needed
3. ✅ Regularly review team members and remove inactive ones
4. ✅ Use specific email addresses, not shared accounts

---

## 🔄 How Team Members Appear on Projects

### Current Implementation (Organization-Level)
- Team members are added at the **organization level**
- All members can access workflows based on their role
- Permissions apply across all projects

### Future Features (Coming Soon)
- **Project-Level Assignment** - Assign specific members to specific workflows
- **Task Assignment** - Assign tasks within workflows to team members
- **Member Avatars** - See who's working on what workflow
- **Activity Tracking** - See what team members are doing
- **@Mentions** - Tag team members in comments
- **Notifications** - Get notified when assigned to tasks

---

## 💡 Common Questions

**Q: Can I change a member's role after inviting them?**  
A: Currently, you would need to remove and re-invite them. Role editing will be added soon.

**Q: How many team members can I add?**  
A: There's no hard limit, but check your subscription plan for team size limits.

**Q: Can members see each other?**  
A: Yes, all team members can see the team list in the Team Management section.

**Q: What happens when I remove a member?**  
A: They lose access to all workflows and cannot log in to the platform.

**Q: Can Editors delete their own workflows?**  
A: No, only Admins and Owners can delete workflows for safety.

---

## 🎨 UI Features

- **Real-time Search** - Instant filtering as you type
- **Color-Coded Roles** - Easy visual identification
- **Status Indicators** - See who's active at a glance
- **Permission Chips** - Quick permission overview
- **Gradient Badges** - Beautiful role indicators
- **Responsive Design** - Works on all screen sizes

---

## 📞 Support

Need help with team management?
- Check the in-app tooltips
- Contact support@flowversal.com
- Visit our help center

---

**Last Updated**: November 2024  
**Version**: 1.0.0
