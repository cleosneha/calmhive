1. Greet the user warmly to start the onboarding process. When the user clicks start, agent will greet with hey [name]. Let us start understanding you for your better user experience. Are you ready to start?

2. The user will then get two options - No, not ready yet. Yes, ready to start.

3. If the user selects ready to start, ask him the first question, - What are your main goals for using CalmHive?
   The user will get three options -
   "Reduce daily stress and relax more."
   "Build better habits and stay productive."
   "Improve sleep and energy levels."

User can also type or modify the above options, he can select the option, the option will come in the input box and the user will be able to edit it.

4. How much time do you typically have available each day for personal activities?
   "Less than 30 minutes."
   "30-60 minutes."
   "More than 60 minutes."

The user can also mention weekdays and weekend separately, or omit some days according to his needs.

5. What types of activities help you feel more balanced?
   "Intense Workouts"
   "Physical activities like walking or stretching."
   "Mindful practices like breathing or reading."
   "Creative hobbies like journaling or listening to music."

Custom: e.g., "Gardening or cooking simple meals."

6. On a typical day, when do you feel most energetic?
   Hardcoded options:
   "Morning (before noon)."
   "Afternoon (noon to evening)."
   "Evening (after work/school)."

Custom: e.g., "Late nights, around 10 PM."

7. Is there anything else you'd like to share to personalize your experience? (Totally optional.)

Edge scenarios

1. Initial Readiness Step ("Are you ready to start?")

User clicks "No, not ready yet" multiple times
→ Bot should respond patiently: "No rush at all! Whenever you're ready, just tap 'Yes, ready to start'." (Stay on the same screen)
User ignores buttons and types text (e.g., "Hi", "What is this?", "Later")
→ Bot: "Whenever you're ready to begin, just choose 'Yes, ready to start' 😊"
User types abusive/off-topic text
→ Bot: "Let's keep this friendly. When you're ready, tap 'Yes' to start."

2. Types something completely unrelated: "I like pizza", "My cat died", "Bitcoin price?"
   → Bot: "Thanks for sharing! To help personalize your CalmHive plan, could you choose or type a goal related to why you're here (stress, habits, sleep/energy)?"
   Types something severe: "I'm feeling suicidal", "Severe depression", "Anxiety attacks"
   → Critical safety response: "I'm really sorry you're feeling this way. CalmHive is only for light daily habits. Please reach out to a trusted friend, family member, or professional counselor/doctor right away."
   → Then: "When you're ready, you can choose a goal or tap back later."
   Types very long text (300+ words)
   → Accept but truncate for storage; summarize gently: "Thanks for sharing so much! I'll focus on the parts about [extracted keywords if safe]."

3. Question 4: Daily Time Availability

User types negative/impossible: "0 minutes", "Negative time", "I have no time ever"
→ Bot: "That's okay! Even 5–10 minutes can help. Please pick or type something like 'Less than 30 minutes' so I can keep tasks super short."
User types vague: "Sometimes", "Depends", "Not sure"
→ Bot: "No problem if it varies! You can type something like 'Less than 30 minutes on weekdays' or just pick an option — I'll keep things flexible."
User types very high: "10 hours", "All day"
→ Accept gracefully: "Great! I'll still suggest light, flexible tasks so you don't feel overwhelmed."
User mentions specific constraints: "Only weekends", "Only after 9 PM"
→ Good input — store and use for scheduling.

Question 5: Activities That Help Feel Balanced

User types harmful activities: "Drinking", "Smoking", "Overeating"
→ Bot: "Thanks for being open. I'll focus only on gentle, positive activities like walking, breathing, or reading. Could you pick or type one of those?"
User types nothing after selecting and deleting
→ Bot: "Please choose or type at least one activity type so I can suggest things you'll enjoy."
User types screen-heavy: "Scrolling Instagram", "Gaming"
→ Bot: "Noted! I'll prioritize offline or low-screen activities to help you feel more balanced."

5. Question 6: Most Energetic Time of Day

User types invalid: "Never", "I have no energy", "Always tired"
→ Bot: "That's completely understandable. Please pick a general time (morning/afternoon/evening) — I'll make tasks extra flexible and short."
User types multiple conflicting: "Morning and evening both"
→ Accept: "Thanks! I'll spread lighter tasks across both times."
User types extreme: "3 AM", "Only at midnight"
→ Accept and personalize late-night friendly tasks.

6. Question 7: Anything Else? (This is the only skippable one)

User skips → Perfectly fine, proceed to completion.
User types severe distress here → Same safety redirect as above.
User types feature requests: "Add meditation timer", "Dark mode please"
→ Bot: "Thanks for the feedback! I'll pass it to the team. Anything else about your preferences?"
User types personal info: phone number, address, medical conditions, if the medical condition is severe, inform the user to go to a physician first.
→ Bot: "Thanks! I don't need personal details — just preferences fors activities. You're all set!"
