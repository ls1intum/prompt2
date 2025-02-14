# Contributor Guidelines
## The 3 Golden Rules
Contributor Guidelines can be a lot to digest—so if you only remember one thing from this guide, let it be these three golden rules.
1. **🧹 Leave It Cleaner Than You Found It**  
   ![cleanup](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3ZmdDY4NWkxdXB4cjRxZnp1ejM0c2swOHg1MXVxNW93a3M1d3g3NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0uVfAhfFv7U5VLJaNx/giphy.gif){.bg-warning h=100px}

   Every time you touch a piece of code, make sure you leave it in a better state than you found it. Think of the codebase as a shared workspace—tidy up as you go, and everyone will appreciate it.

2. **🔍 Do It Right the First Time**  
   "I'll do it quickly now, and fix it later."  

   ![no](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjZlem40YWdnOGs1ajJ4bHBvNWY1dXZpYzIxYnN1eHdlMm13ZnJvZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hyyV7pnbE0FqLNBAzs/giphy.gif){.bg-warning h=100px}

   Let’s be honest—you’re unlikely to come back and clean it up later. Aim for quality from the start, and spare yourself (and your fellow developers) a later headache.

3. **🤓 Take Pride in Your Work: Write Code That’s a Joy to Read and Pay Attention to the Detail**  
  ![cleanCode](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWp3bzg3bHNpY2dibHFqczhlM3p1NjFva3g3cXU4OWxxdGxnaDByeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Cz1it5S65QGuA/giphy.gif){.bg-warning h=100px}

   Be proud of every line you write. Craft code that’s not only functional but also a delight to read and review.
   Our project thrives on the passion and dedication of its contributors—your enthusiasm makes all the difference.
   Remember, it’s the little things—the careful touches and attention to detail—that differentiates a good software from a great software.
---

## Our Beloved Prompt: Nurturing a Healthy Codebase

Think of our course management tool as our baby—it needs proper care to grow into a robust, well-rounded adult. Here’s how to help it flourish, especially when preparing PRs:

### Top 10 PR Best Practices

1. **Take Your Time**  
   Quality code isn’t produced in a rush. Review your work thoroughly especially when you review PRs.

2. **Use Clear Method and Variable Names**  
   Choose names that explain what the method does. If it sounds like a riddle, it’s time for a rename.

3. **Keep Files Short and Focused**  
   Each file should have a single, clear purpose. In TypeScript, try to keep files under 200 lines—let’s save the epic sagas for novels.

4. **Maintain a Consistent File/Folder Structure**  
   - **Server Side:** Every component should have the files `main`, `router`, `service`, `verification`
   - **Client Side:** Use the folders `components`, `hooks`, `utils`, `pages`, `interfaces`, `network` and use descriptive File names. (i.e. Pages should end with `...Page.tsx` and dialogs with `...Dialog.tsx`)
   
   Deviate only when you have a solid reason—and don’t forget to comment on it!  

5. **Avoid Copy-Pasting Code**  
   If you’re tempted to copy code, instead abstract it into a reusable function. Reuse wisely—no one wants to chase down duplicated bugs.

6. **Keep Related Functionality Together**  
   Place utility functions, interfaces, etc., close to where they’re needed but ensure they’re accessible to all parts of the codebase that require them.

7. **Stick to camelCase for Variables**  
   Consistency is key. Using camelCase everywhere keeps our code clean and our brains happy.

8. **Comment on Deviations**  
   Sometimes, the standard won’t quite fit. If you need to deviate, explain why with a comment. Future you (and your fellow developers) will thank you.

9. **Eliminate Dead Code Immediately**  
   “I might need this later” is a myth. Dead code clutters the project. Remember: Git history is your safety net if you ever need to recover something.


**Important**
    This list isn’t exhaustive. As we learn and grow, so should our guidelines. Update and refine these rules regularly—after all, improvement is a journey, not a destination.

---

**Your read through the whole guide.** 

![thankYou](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzl5OHl4cHR2OXY2Y2Z2Y3BmdHVuMWhvbmdubHRqdzZrZmRkaDAyNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/M9NbzZjAcxq9jS9LZJ/giphy.gif){.bg-warning h=150px}

Now, you are ready to write AWESOME Prompt Code!
