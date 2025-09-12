#include <iostream>
#include <ctime>

int main()
{
  time_t timeNow;
  struct tm *t;
  timeNow = time(NULL);
  t = localtime(&timeNow);

  std::cout << t->tm_year + 1900 << "-";
  if (t->tm_mon + 1 < 10)
  {
    std::cout << "0";
  }
  std::cout << t->tm_mon + 1 << "-";
  if (t->tm_mday < 10)
  {
    std::cout << "0";
  }
  std::cout << t->tm_mday << std::endl;
  return 0;
}