# Project Tracker

Project Tracker is a minimalistic project management cum timesheet generation tool for agile teams. This repo contains the RESTapi (back end code) for the app. Please find the front end code [here](https://github.com/rethna2/projectTracker).

## Guidelines:

1. Grunt tasks like meeting, discussions, and repeated maintanace task should be handled outside the tool. The app will focus only on 'real' work.
2. Most of the companies requires only 6hrs of real work in an 8 hrs day. So the remaining 2 hours goes to other tasks like meeting, discussion, emails, etc
3. Estimation is always done in points (and not in hours) based on the complexity of the implementation points. The time taken to complete a task depend on the expertise of the developer. We can roughly approximate this to something like below.
   * beginner = 2hrs/point
   * experienced = 1 hrs/point
   * expert = 0.5 hrs/point
4. Again this is not correct for all cases. If the work is very simple, then everyone will take the same time. At the same time, if the work is very complex, the beginner may not be able to complete the task.
