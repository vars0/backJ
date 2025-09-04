#include <iostream>
#include <string>

int main(int argc, char **argv)
{
  std::string N = "";
  int line_count = 0;
  while (std::cin >> N)
  {
    std::getline(std::cin, N);
    line_count++;
  }
  std::cout << line_count;
  return 0;
}