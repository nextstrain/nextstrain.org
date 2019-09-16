---
title: "Help! I'm using Windows"
---

Nextstrain documentation assumes users are running a Unix-based system like Mac OS X or Linux. 
It is in theory possible to install and run Nextstrain components in Windows natively, but it will be less straightforward, and won't be covered here. 

However, a new feature in Windows 10 means you can easily run a 'subsystem' of Linux on your Windows machine, ensuring you'll be able to use exactly the same commands as given in the documentation.

After installing, you may want to Google for some information (or a tutorial) on basic Linux commands.
This guide will assume you're relatively new to Linux/Ubuntu; if you're a more advanced user you may want to modify the instructions to suit your preferences.

## Enable and Install Ubuntu via Microsoft Store
The Windows Subsystem for Linux is developed and supported by Microsoft, so it will not cause any problems for your computer. 
It is not a 'dual-boot' system, where you must restart to switch between Windows and Ubuntu; you'll be able to run Ubuntu in a window within Windows.
Though multiple Linux distributions are now available, we recommend installing Ubuntu, as it has lots of support available online for Windows 10 installations.

[Follow these instructions](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to install Windows Subsystem for Linux, and select 'Ubuntu' from the Store.
Be sure to follow the instructions for 'initialization of your distro', and update/upgrade Ubuntu using 
```
sudo apt update && sudo apt upgrade
```

Take note of your password; you'll need this whenever you run `sudo` commands (like running 'as administrator' in Windows).

## Create a Link to Your Files

You can start Ubuntu on Windows by going to the Start Menu and selecting 'Ubuntu'. 
The default working directory (your location on starting Ubuntu) is buried in an odd place within the Windows filesystem.
You probably don't want to put files here, as they'll be hard to find from Windows applications.

Instead, we'll make a 'symbolic link' or 'symlink' (like a 'shortcut' in Windows) so you can easily jump to the directory where your files are stored. 
Here, we'll make a symlink to `C:\Users\<user>\Documents` (replace \<user\> with your username), but you could point it to wherever would be useful for you.

The first part (`../../mnt/c/Users/<user>/Documents`) is where you'd like the link to go (`mnt/c/` is how to access the `C:` drive from here in Ubuntu), and `documents` is the name of the symlink.

```
ln -s ../../mnt/c/Users/<user>/Documents documents
```

To use the symlink, just type `cd documents` - you'll go directly to the usual 'Documents' folder in Windows.
You might want to get into the habit of using `cd documents` immediately whenever you start Ubuntu, so that files you download and run are always in the same place.


## Install Miniconda

Miniconda allows you to create 'environments' within Ubuntu and more easily install some packages.
We'll do this to make the installation of some Nextstrain components easier.

Download the latest Python 3.6 Linux version of [Miniconda](https://conda.io/miniconda.html). 
You may want to move the download to inside the folder your symlink leads to, to make it easier to navigate to the file location within Ubuntu.

Once inside the folder with the file you downloaded, type `bash` followed by the name of the file you downloaded. For example:
```
bash Miniconda3-latest-Linux-x86_64.sh
```

Follow the prompts and accept the defaults if you are unsure. 
You'll need to close and re-open your Ubuntu window to finish the installation.

After re-opening Ubuntu, you can type `conda list` to ensure it's installed correctly.

## Install Nextstrain

You're now ready to [install the Nextstrain programs](/docs/getting-started/installation) and can jump right to [installing Augur & Auspice with Conda](/docs/getting-started/installation#install-augur--auspice-with-conda-recommended).

## You're done!

Note that you'll always need to open an Ubuntu window and use `conda activate nextstrain` before running any of the Nextstrain programs like `nextstrain`, `augur`, and `auspice`.

#Important Note:
**Never modify your Ubuntu system files (like `.bashrc`) in Windows!**
Use an editor within Ubuntu, like `vi` or `vim`. 