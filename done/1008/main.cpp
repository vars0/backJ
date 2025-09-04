#include <iostream>
int main(int argc, char **argv)
{
  double a = 0, b = 0;
  std::cin >> a >> b;
  double c = a / b;
  std::cout.precision(10);
  std::cout << c;
  return 0;
}