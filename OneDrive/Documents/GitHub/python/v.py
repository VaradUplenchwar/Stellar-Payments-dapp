name = input("Whats yout name?")
file=open("names.txt","a")
file.write(name)
file.close()