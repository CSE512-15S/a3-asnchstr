Herbie Data Exploration
=======================

Initial Description
-------------------

For this visualization assignment, I'm using a dataset from my
research. My research is on improving the accuracy of floating point
programs. To do this, we need to understand what the accuracy of a
particular floating point program is. Since the error of these
programs depends on what it's inputs are, the error of one is a
multidimensional quantity, two dimensional if there is only one input,
but for more inputs there are more dimensions. Since it is hard to
visualize higher dimensional data, I instead generally think of it as
two dimensional, with other input values ignored for visualizing. For
each program, I have a list of data points, where a data point is a
set of inputs, and an amount of error, measured in bits from zero to
sixty four. There are generally thousands of such points in each
dataset. Most of this data is bunched around zero and sixty four bits
of error, but the way it generally varies is how many points are in
each.

To visualize this data, I'll have two displays. The first will display
the data points on a traditional two dimensional graph, where the user
can enter an input variable to be shown as the x dimension, and the y
dimension is error. In addition to this, I'll draw the average error
as a line. This will be done for both input and output programs, on
the same graph but in different colors, so the user can easily see
where the programs error differs. But, were these the only graphical
elements, it would be hard to get a sense of the error distribution.

For the second display, I'll have a density graph of the points, with
the y axis showing bits of error, and the x axis showing how many
points have that much error. Instead of doing this for the whole
dataset, I'll allow the user to select bounds on the first display, so
that they can investigate how the error is distributed in any region
of the x axis value they have selected.


Final Writeup
-------------

At first I was planning on changing a few things from my initial
storyboard, but over time I was able to implement everything that I
had originally outlined. Unfortunately not all the logic could be done
client side in d3. In particular, the scaling used for the graph
requires taking floating point numbers and converting them to their
bit representation, and then back as integers, so that you get a scale
that matches how the floats are distributed. As a result, the graphs
are drawn by racket to three static images, and the points are then
converted to their ordinal representation before being written to
json, so that the javascript could easily scale the selection
properly, and filter the points properly.

One of the hardest design challenges was figuring out how to make the
three different histograms visible at the same time and visually
distinct. In the end I gave them each lines to show trends of nearby
data, and gave them very distinct colors, as well as drew the ones
rendered closer to the back in thicker line so that they could never
by occluded by one in front of them.

The project took about twelve person hours to implement. Most of the
time was spent polishing aspects of the interface and learning d3. A
basic version was finished in about eight person hours, and then
implementing smoother interactivity, axis switching, proper scaling,
and applying it to a more complex example took another four.
